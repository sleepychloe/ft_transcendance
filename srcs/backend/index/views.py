from django.shortcuts import render
import jwt
import os
# Create your views here.

def index(request):
	token = request.COOKIES.get('jwt_token', None)
	if token:
		try:
			print("in the view.index : good")
			decoded_token = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=['HS256'])
			context = {'user_name' : decoded_token['user_name'], 'user_id': decoded_token('user_id')}
			return render(request, 'index/index.html', context)
		except jwt.ExpiredSignatureError:
			print("in the view.index : error1")
			return render(request, 'index/lobby.html')
		except jwt.InvalidTokenError:
			print("in the view.index : error2")
			return render(request, 'index/lobby.html')
		except:
			print("in the view.index : error3")
			return render(request, 'index/lobby.html')
	print("in the view.index : no cookie")
	return render(request, 'index/lobby.html')
