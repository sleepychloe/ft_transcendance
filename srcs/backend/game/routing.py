from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
	path('ws/', consumers.defaultConsumer.as_asgi()),
	# re_path(r"ws/(?P<game_id>\w+)", consumers.MultiGameRoomConsumer.as_asgi())
]
