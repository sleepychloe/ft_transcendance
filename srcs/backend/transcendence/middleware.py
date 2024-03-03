from django.http import JsonResponse
import jwt
import os
# from .

EXCLUDED_PATH = ['/apitest/', '/api/login/', '/login/']

def should_exclude_path(request_path):
	return any(request_path.startswith(path) for path in EXCLUDED_PATH)

def jwt_verification(token):
    if token:
        try:
            jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=['HS256'])
            return True
        except:
            return False
    return False

def jwt_middleware(get_response):
    def middleware(request):
        try:
            if request.path == "/" or request.path == "/favicon.ico/":
                return get_response(request)
            if should_exclude_path(request.path):
                return get_response(request)

            jwt_token = request.COOKIES.get('jwt_token', None)
            if jwt_token == None:
                return JsonResponse({'error': 'JWT token not found in the Authorization header'}, status=401)
            if not jwt_verification(jwt_token):
                return JsonResponse({'error': 'Invalid token'}, status=401)

            response = get_response(request)
            return response

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=401)
    return middleware