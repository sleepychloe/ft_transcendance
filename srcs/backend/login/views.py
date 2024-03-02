from django.shortcuts import render
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from .models import User42Info
from django.db import transaction
import json
import os
import requests
from PIL import Image
from io import BytesIO
import jwt


class Auth42View(View):
	def get(self, request):
		auth_client_key = os.getenv("42_AUTH_CLIENT_KEY")
		redirect_key = os.getenv("42_AUTH_REDIRECT_KEY")
		url =  f"https://api.intra.42.fr/oauth/authorize?client_id={auth_client_key}&redirect_uri={redirect_key}&response_type=code"
		
		response = HttpResponseRedirect(url)
		response['Access-Control-Allow-Methods'] = '*'
		response['Access-Control-Allow-Headers'] = '*'
		return response

class Auth42CallBackView(View):
	def get(self, request):
		code = request.GET.get('code', None)
		if code == None:
			return JsonResponse({"Error": "No code in request"}, status=400)
		
		auth_client =  os.getenv("42_AUTH_CLIENT_KEY")
		auth_secret = os.getenv("42_AUTH_SECRET_KEY")
		auth_redirect = os.getenv("42_AUTH_REDIRECT_KEY")

		data = (f"client_id={auth_client}&client_secret={auth_secret}&redirect_uri={auth_redirect}&grant_type=authorization_code&code={code}&scope=public")
		
		response = requests.post("https://api.intra.42.fr/oauth/token/", data=data)
		if response.status_code != 200:
			print("response",response.status_code,response.content)
			return JsonResponse({"Error": "Not good code"}, status=400)
		token = response.json().get('access_token')
		user_data = self.save_or_find_user_info(token)
		if user_data == None:
			return JsonResponse({"Error": "42 api server no response"}, status=400)
		jwt_secret_key = os.getenv("JWT_SECRET_KEY")
		jwt_token = jwt.encode({"user_name" : user_data.Username, "user_id": user_data.Userid},
						 jwt_secret_key, algorithm="HS256")
		root_url = reverse('index')
		response = HttpResponseRedirect(root_url)
		response.set_cookie('jwt_token', jwt_token)
		return response

	@transaction.atomic
	def save_or_find_user_info(self, token):
		response = requests.get("https://api.intra.42.fr/v2/me"
						  , headers={"Authorization": f"Bearer {token}"})
		if response.status_code != 200:
			return None
		user_info = json.loads(response)
		response = requests.get(user_info['image'])
		if response.status_code == 200:
			user_avatar = Image.open(BytesIO(response.content))
		else:
			user_avatar = None
		user_data = User42Info.objects.select_for_update().get(Username=user_info['fullname'])
		if not user_data:
			user_data = User42Info.objects.create(Username=user_info['fullname'], Userid=user_info['login'], avatar=user_avatar)
		user_data.save()
		return user_data

# class Auth42CallBackView(View):
# 	asdf