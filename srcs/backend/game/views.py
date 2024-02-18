from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from .models import MultiRoomInfo
# Create your views here.

class GameMakeRoomView(View):

	def get(self, request):
		new_room_id = create_new_game_id()

		quantity_player = request.GET.get('quantity_player', 0)
		# if quantity_player is None:
		# 	return JsonResponse({'Error' : 'Quantity player is required.'})
		if MultiRoomInfo.objects.filter(RoomName=new_room_id).exists():
			return JsonResponse({'Error' : 'Room id already exists.'})
		new_data = MultiRoomInfo.objects.create(RoomName=new_room_id, QuantityPlayer=quantity_player)
		new_data.save()
		return JsonResponse({'Room id' : new_room_id, 'quantity player' : quantity_player})

def create_new_game_id():
	import uuid
	return str(uuid.uuid4())
		
# class GameRoomInfoView(View):

# 	def get(self, request, game_id):
# 		GameRoom = MultiRoomInfo.objects.filter(RoomName=game_id).get()

# 		GameRoom.objects.
