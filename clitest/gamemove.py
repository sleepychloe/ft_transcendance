import argparse
import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# uri_template = "https://10.12.1.3:4243/apitest/{game_id}/move"
uri_template = "https://localhost:4243/apitest/{game_id}/move"
# base_uri = "https://10.12.1.3:4243/"
base_uri = "https://localhost:4243/"

def get_cookie():
    session = requests.Session()
    session.verify = False
    csrf_token_url = base_uri
    csrf_token_response = session.get(csrf_token_url)
    return csrf_token_response.cookies

def move_game(game_id, client_id):
	uri = uri_template.format(game_id=game_id)
	cookie = get_cookie()
	csrf_token = cookie.get('csrftoken')
	headers = {}
	headers = {
		"Content-Type": "application/json",
		"X-CSRFToken": csrf_token,
	}
	session = requests.Session()
	session.verify = False
	while True:
		key = input("Give me a direction (w = up, s = down, q = quit) : ")
		if key == 'w' or key == 'W':
			jsondata = {"client_id":client_id, "direction":"up"}
			data = json.dumps(jsondata)
		elif key == 's' or key == 'S':
			jsondata = {"client_id":client_id, "direction":"down"}
			data = json.dumps(jsondata)
		elif key == 'q' or key == 'Q':
			print("bye")
			return
		else:
			print("not a good key, again")
			continue
		response = session.put(uri, headers=headers, cookies=cookie, data=data)
		try:
			data = json.loads(response.content)
		except json.JSONDecodeError as e:
			print("Reponse is not json.")
			break
		data = json.dumps(data, indent=2)
		print(data)

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('game_id', type=str)
	parser.add_argument('client_id', type=str)
	args = parser.parse_args()

	move_game(args.game_id, args.client_id)

if __name__ == "__main__":
	main()