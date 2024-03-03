from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from .models import User42Info
import jwt
import os
import base64

class UserAvatarGetView(View):
	def get(self, request):
		token = request.COOKIES.get('jwt_token', None)
		if token:
			try:
				decoded_token = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=['HS256'])
				user_name = decoded_token['user_name']
				if User42Info.objects.filter(Username=user_name).exists():
					user_data = User42Info.objects.get(Username=user_name)
					image_link = user_data.Useravatar
					return JsonResponse({user_name : image_link})
				else:
					return JsonResponse({"Error":"User not found in db"}, status=404)
			except:
				return JsonResponse({"Error" : "jwt token not good"}, status=401)
		return JsonResponse({"Error": "Not authorized user"}, status=401)

class UserIntraIdGetView(View):
	def get(self, request):
		token = request.COOKIES.get('jwt_token', None)
		if token:
			try:
				decoded_token = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=['HS256'])
				user_id = decoded_token['user_id']
				return JsonResponse({"user_id" : user_id})
			except:
				return JsonResponse({"Error" : "jwt token not good"}, status=401)
		return JsonResponse({"Error": "Not authorized user"}, status=401)

