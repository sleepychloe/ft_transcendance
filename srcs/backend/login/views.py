from django.shortcuts import render
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect, HttpResponseForbidden
from django.core.files import File
from django.urls import reverse
from user.models import User42Info
from django.db import transaction
from index.views import index
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
			return HttpResponseForbidden()
		
		auth_client =  os.getenv("42_AUTH_CLIENT_KEY")
		auth_secret = os.getenv("42_AUTH_SECRET_KEY")
		auth_redirect = os.getenv("42_AUTH_REDIRECT_KEY")

		data = (f"client_id={auth_client}&client_secret={auth_secret}&redirect_uri={auth_redirect}&grant_type=authorization_code&code={code}&scope=public")
		
		response = requests.post("https://api.intra.42.fr/oauth/token/", data=data)
		if response.status_code != 200:
			return HttpResponseForbidden()
		token = response.json().get('access_token')
		user_data = self.save_or_find_user_info(token)
		if user_data == None:
			return HttpResponseForbidden()
		jwt_secret_key = os.getenv("JWT_SECRET_KEY")
		jwt_token = jwt.encode({"user_name" : user_data.Username, "user_id": user_data.Userid},
						 jwt_secret_key, algorithm="HS256")
		root_url = reverse(index)
		response = HttpResponseRedirect(root_url)
		response.set_cookie('jwt_token', jwt_token)
		return response

	@transaction.atomic
	def save_or_find_user_info(self, token):
		response = requests.get("https://api.intra.42.fr/v2/me"
						  , headers={"Authorization": f"Bearer {token}"})
		if response.status_code != 200:
			return None
		user_info = json.loads(response.content.decode('utf-8'))
		if response.status_code == 200:
			user_avatar = user_info['image']['versions']['small']
		else:
			user_avatar = None
		if User42Info.objects.filter(Username=user_info['displayname']).exists():
			user_data = User42Info.objects.select_for_update().get(Username=user_info['displayname'])
			return user_data
		else:
			user_data = User42Info.objects.create(Username=user_info['displayname'], Userid=user_info['login'])
			if user_avatar:
				user_data.Useravatar = user_avatar
			user_data.save()
			return user_data
