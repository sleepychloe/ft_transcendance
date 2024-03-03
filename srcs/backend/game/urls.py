from django.urls import path
from .views import *

urlpatterns = [
	path('makeroom/', GameRoomMakeView.as_view()),
	path('listroom/', GameRoomListView.as_view()),
	path('<str:game_id>/', GameRoomJoinView.as_view()),
]