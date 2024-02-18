from django.urls import path
from .views import *

urlpatterns = [
	path('makeroom/', GameMakeRoomView.as_view()),
	# path('<str:game_id>/', GameRoomInfoView.as_view()),
]