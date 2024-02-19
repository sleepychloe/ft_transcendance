from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
	# path('ws/', consumers.MultiGameConsumer.as_asgi()),
	re_path(r"ws/(?P<game_id>\w+)", consumers.MultiGameConsumer.as_asgi())
]
