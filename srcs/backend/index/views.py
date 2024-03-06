from django.shortcuts import render
import jwt
import os
# Create your views here.

# def index(request):
# 	token = request.COOKIES.get('jwt_token', None)
# 	if token:
# 		try:
# 			decoded_token = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=['HS256'])
# 			context = {'user_name' : decoded_token['user_name'], 'user_id': decoded_token['user_id']}
# 			return render(request, 'index/index.html', context=context)
# 		except jwt.ExpiredSignatureError:
# 			return render(request, 'index/lobby.html', status=401)
# 		except jwt.InvalidTokenError:
# 			return render(request, 'index/lobby.html', status=401)
# 	return render(request, 'index/lobby.html')

def index(request):
	return render(request, 'index/index.html')