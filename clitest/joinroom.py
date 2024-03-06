import argparse
import requests
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# view_uri_template = "https://10.12.1.3:4243/apitest/{game_id}/"
view_uri_template = "https://localhost:4243/apitest/{game_id}/"
# base_uri = "https://10.12.1.3:4243/"
base_uri = "https://localhost:4243/"

def game_view_request(game_id):
    uri = view_uri_template.format(game_id=game_id)
    cookie = get_cookie()
    csrf_token = cookie.get('csrftoken')
    headers ={}
    headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token,
    }
    session = requests.Session()
    session.verify = False
    response = session.put(uri, headers=headers, cookies=cookie)
    try:
        data = json.loads(response.content)
    except json.JSONDecodeError as e:
        print(f'Error decoding JSON data: {e}')
        return
    data = json.dumps(data, indent=2)
    print(data)

def get_cookie():
    session = requests.Session()
    session.verify = False
    csrf_token_url = base_uri
    csrf_token_response = session.get(csrf_token_url)
    return csrf_token_response.cookies

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('game_id', type=str)
	args = parser.parse_args()
	game_view_request(args.game_id)
if __name__ == "__main__":
    main()