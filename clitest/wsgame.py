import json
import argparse
import websocket
from websocket import create_connection
# from websockets.exceptions import WebSocketException
import ssl
import urllib3
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# base_uri = "https://10.12.1.3:4243/"
base_uri = "https://localhost:4243/"
# uri_template = "wss://10.12.1.3:4243/ws/{game_id}/"
uri_template = "wss://localhost:4243/ws/{game_id}/"

def get_cookie():
    session = requests.Session()
    session.verify = False
    csrf_token_url = base_uri
    csrf_token_response = session.get(csrf_token_url)
    return csrf_token_response.cookies

def check_game_id(game_id):
    url = base_uri + "apitest/listroom/"
    cookies = get_cookie()
    csrf_token = cookies.get('csrftoken')
    headers = {}
    headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf_token,
        }
    session = requests.Session()
    session.verify = False
    response = session.get(url, headers=headers, cookies=cookies)
    body = json.loads(response.content.decode('utf-8'))
    for room in body:
        if room['room_id'] == game_id:
            return True
    return False


def start_game(uri, game_id, client_id, n_client):
    uri = uri.format(game_id=game_id)
    sslopt = {"cert_reqs": ssl.CERT_NONE}
    cookie = "client_id="
    cookie = cookie + client_id
    header = {
        "cookie": cookie
    }
    if not check_game_id(game_id):
        print("Not good game_id :(")
        return
    try:
        ws = create_connection(url=uri, sslopt=sslopt, header=header)
        print("websocket connection success")
        data1 = json.dumps({"client_id": client_id, "n_client": n_client})
        ws.send(f'{{"action":"update","type":"player_info","data":{data1}}}')
        data2 = json.dumps({"n_client":n_client})
        ws.send(f'{{"action":"update", "type":"ready_status","data":{data2}}}')
        while True:
            try:
                data = ws.recv()
                data = json.loads(data)
                data = json.dumps(data, indent=2)
                print("Received message:", data)
            except json.decoder.JSONDecodeError as e:
                print("Response is not json")
                break
    except websocket.WebSocketConnectionClosedException as e:
        print("Argument value is not good.")
    except WebSocketException as e:
        print("Argument value is not good.")
    except json.decoder.JSONDecodeError as e:
        print("Argument value is not good.")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('game_id', type=str)
    parser.add_argument('client_id', type=str)
    parser.add_argument('n_client', type=str)
    args = parser.parse_args()

    uri = uri_template  # Use the global template
    start_game(uri, args.game_id, args.client_id, args.n_client)

if __name__ == "__main__":
    main()