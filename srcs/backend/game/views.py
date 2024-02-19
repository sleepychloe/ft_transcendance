import json
from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from .models import MultiRoomInfo
# Create your views here.

def create_new_uuid():
	import uuid
	return str(uuid.uuid4())


class GameRoomMakeView(View):

	def post(self, request):
		new_room_id = create_new_uuid()

		quantity_player = request.GET.get('quantity_player', 1)
		# if quantity_player is None:
		# 	return JsonResponse({'Error' : 'Quantity player is required.'})
		if MultiRoomInfo.objects.filter(Roomid=new_room_id).exists():
			return JsonResponse({'Error' : 'Game id already exists.'})
		try:
			room_name = json.loads(request.body).get("room_name")
		except json.JSONDecodeError:
			return JsonResponse({'Error' : 'Roomname is not json.'})
		new_data = MultiRoomInfo.objects.create(Roomid=new_room_id, RoomName=room_name, QuantityPlayer=quantity_player)
		new_data.save()
		return JsonResponse({'room_id' : new_room_id, 'room_name' : room_name, 'quantity_player' : quantity_player})


class GameRoomListView(View):
	
	def get(self, request):
		all_data = MultiRoomInfo.objects.all()
		serialized_data = self.serialize_model_to_json(all_data)
		return JsonResponse(serialized_data, safe=False)

	@staticmethod	
	def serialize_model_to_json(queryset):
		serialized_data = [
			{
				'room_id': it.Roomid,
				'room_name': it.RoomName,
				'quantity_player': it.QuantityPlayer,
				'created_time': it.CreatedTime,
			}
			for it in queryset
		]
		return serialized_data

class GameRoomJoinView(View):

	def get(self, request, game_id):
		try:
			room = MultiRoomInfo.objects.get(Roomid=game_id)
		except MultiRoomInfo.DoesNotExist:
				return JsonResponse({'Error' : 'Game id URL is not exists'})
		client_id = request.COOKIES.get('client_id')
		if client_id:
			return JsonResponse({'Error' : 'Can not request several time in same browser'})

		if room.QuantityPlayer < 4 and not client_id:
			room.QuantityPlayer += 1
			room.save()
			client_id = create_new_uuid()
			client = self.check_client_id_for_data(game_id, client_id)
			response = JsonResponse({'room_id' : game_id, 'quantity_plyaer' : room.QuantityPlayer, 'client_id': client_id, 'N.client': client})			
			response.set_cookie('client_id', client_id)
			return response
		return JsonResponse({'Error' : 'Quantity player exceeds the limit.'})
	
	@staticmethod
	def check_client_id_for_data(game_id, client_id):
		if not MultiRoomInfo.objects.filter(client1=client_id).exists():
			instance = MultiRoomInfo.objects.get(Roomid=game_id)
			instance.client1 = client_id
			instance.save()
			return "client1"
		elif not MultiRoomInfo.objects.filter(client2=client_id).exists():
			instance = MultiRoomInfo.objects.get(Roomid=game_id)
			instance.client2 = client_id
			instance.save()
			return "client2"
		elif not MultiRoomInfo.objects.filter(client3=client_id).exists():
			instance = MultiRoomInfo.objects.get(Roomid=game_id)
			instance.client3 = client_id
			instance.save()
			return "client3"
		elif not MultiRoomInfo.objects.filter(client4=client_id).exists():
			instance = MultiRoomInfo.objects.get(Roomid=game_id)
			instance.client4 = client_id
			instance.save()
			return "client4"

	def delete(self, request, game_id):
		try:
			room = MultiRoomInfo.objects.get(Roomid=game_id)
		except MultiRoomInfo.DoesNotExist:
			return JsonResponse({'Error' : 'Room id does not exist.'})
		room.QuantityPlayer -= 1
		client_id = request.COOKIES.get('client_id')
		self.delete_client_id_in_data(game_id, client_id)
		if room.QuantityPlayer == 0:
			room.delete()
		response = JsonResponse({'Room id' : game_id, 'Status' : 'Ok'})
		response.delete_cookie('client_id')
		return response
	
	def delete_client_id_in_data(game_id, client_id):
		room = MultiRoomInfo.objects.get(Roomid=game_id)
		if room.client1 == client_id:
			room.client1 = None
		elif room.client2 == client_id:
			room.client2 = None
		elif room.client3 == client_id:
			room.client3 = None
		elif room.client4 == client_id:
			room.client4 = None
		room.save()


# class GameInitView(View):
