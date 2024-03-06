import requests
import json
import argparse
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# uri_template = "https://10.12.1.3:4243/apitest/{game_id}/move"
uri_template = "https://localhost:4243/apitest/{game_id}/move"


# base_uri = "https://10.12.1.3:4243/apitest/"
base_uri = "https://localhost:4243/apitest/"

def get_cookie():
    session = requests.Session()
    session.verify = False
    csrf_token_url = base_uri + "user/csrftoken/"
    csrf_token_response = session.get(csrf_token_url)
    return csrf_token_response.cookies

def make_api_call(endpoint, method="GET", cookies=None, data=None):
    url = base_uri + endpoint
    csrf_token = cookies.get('csrftoken')

    headers = {}
    headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf_token,
        }
    session = requests.Session()
    session.verify = False
    if method == "GET":
        response = session.get(url,headers=headers, cookies=cookies)
    elif method == "POST":
        response = session.post(url, headers=headers, cookies=cookies, json=data)
        if endpoint=="makeroom/":
            body = json.loads(response.content.decode('utf-8'))
            game_id = body['room_id']
            url = BASE_URL + game_id + '/delete'
            response = session.delete(url, headers=headers, cookies=cookies, json=data)
    elif method == "PUT":
        response = session.put(url, headers=headers, cookies=cookies)
    else:
        print(f"Unsupported HTTP method: {method}")
        return False
        
    return response

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('endpoint', type=str)
    parser.add_argument('method', type=str)
    parser.add_argument('data', type=str)

    args = parser.parse_args()
    csrfcookie = get_cookie()

    if args.method.upper() == 'POST' or args.method.upper() == 'PUT':
        if not args.data:
            print('Error: --data is required for POST and PUT requests.')
            return
        try:
            data = json.loads(args.data)
        except json.JSONDecodeError as e:
            print(f'Error decoding JSON data: {e}')
            return
    else:
        data = None

    response = make_api_call(args.endpoint, method=args.method, cookies=csrfcookie, data=data)
    if response:
        print(f"Response Status: {response.status_code}")
        try:
            data = json.loads(response.content)
        except json.JSONDecodeError as e:
            print(f'Error decoding JSON data: {e}')
            return
        data = json.dumps(data, indent=2)
        print(data)
        return
    else:
        print(f"Response Status: {response.status_code}")
        return 

if __name__ == '__main__':
    main()