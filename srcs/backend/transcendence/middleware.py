from django.http import JsonResponse
import jwt
import os
# from .

EXCLUDED_PATH = ['/api/test/', '/api/login/', '/']

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
            if should_exclude_path(request.path):
                return get_response(request)

            authorization_header = request.headers.get('Authorization', '')
            if authorization_header.startswith('Bearer '):
                token = authorization_header[len('Bearer '):].strip()
            else:
                return JsonResponse({'error': 'JWT token not found in the Authorization header'}, status=401)

            if not jwt_verification(token):
                return JsonResponse({'error': 'Invalid token'}, status=401)

            response = get_response(request)
            return response

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=401)
    return middleware