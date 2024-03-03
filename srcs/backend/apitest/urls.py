from django.urls import path
from .views import *

urlpatterns = [
	path('makeroom/', TESTGameRoomMakeView.as_view()),
	path('listroom/', TESTGameRoomListView.as_view()),
	path('<str:game_id>/', TESTGameRoomJoinView.as_view()),
	path('<str:game_id>/delete', TESTGameRoomDeleteView.as_view()),
	path('<str:game_id>/move', TESTGameRoomMoveView.as_view()),
]