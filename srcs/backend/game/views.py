import json
from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from .models import MultiRoomInfo
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from channels.layers import get_channel_layer
# Create your views here.

def create_new_uuid():
	import uuid
	return str(uuid.uuid4()).replace("-", "")

@method_decorator(csrf_exempt, name='dispatch')
class GameRoomMakeView(View):

	def post(self, request):
		new_room_id = create_new_uuid()
		client_id = create_new_uuid()
		channel_layer = get_channel_layer()

		quantity_player = request.GET.get('quantity_player', 1)
		if MultiRoomInfo.objects.filter(Roomid=new_room_id).exists():
			return JsonResponse({'Error' : 'Game id already exists.'})
		try:
			room_name = json.loads(request.body).get("room_name")
		except json.JSONDecodeError:
			return JsonResponse({'Error' : 'Roomname is not json.'})
		new_data = MultiRoomInfo.objects.create(Roomid=new_room_id, RoomName=room_name,
										  QuantityPlayer=quantity_player, QuantityPlayerReady=0,
										  client1={'online': True, 'paddle': None, 'client_id':client_id,
					 					'ready_status': 'not ready'}, client2={}, client3={}, client4={}) # why this is called on client1 ready
		new_data.save()
		channel_layer.group_add(new_room_id, 'BACKEND')
		response = JsonResponse({'room_id' : new_room_id, 'client_id' : client_id,
						   'room_name' : room_name, 'quantity_player' : quantity_player,
						   'quantity_player_ready' : 0, 'n_client' : 'client1'})
		response.set_cookie('client_id', client_id)
		return response


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
				'client1': it.client1,
				'client2': it.client2,
				'client3': it.client3,
				'client4': it.client4,
			}
			for it in queryset
		]
		return serialized_data

class GameRoomJoinView(View):
	def search_client_data(self, room, client_id):
		if room.client1['client_id'] == client_id:
			return 'client1'
		elif room.client2['client_id'] == client_id:
			return 'client2'
		elif room.client3['client_id'] == client_id:
			return 'client3'
		elif room.client4['client_id'] == client_id:
			return 'client4'
		return None

	def get(self, request, game_id):
		try:
			room = MultiRoomInfo.objects.get(Roomid=game_id)
			print("very first room:", room)
		except MultiRoomInfo.DoesNotExist:
				return JsonResponse({'Error' : 'Game id URL is not exists'})
		client_id = request.COOKIES.get('client_id')
		if room.GameStatus == True:
			Nclient = self.search_client_data(room, client_id)
			if Nclient == None:
				print("error : RoomJoinView, GameStatus True, client_id None")
				return JsonResponse({'Error' : 'You can not join another room !'})
			else:
				print('room_id', game_id, '\nroom_name', room.RoomName)
				return JsonResponse({'status': 'reconnect', 'room_id' : game_id, 'room_name' : room.RoomName, 'quantity_player' : room.QuantityPlayer, 'quantity_player_ready' : room.QuantityPlayerReady, 'client_id': client_id, 'n_client': Nclient})
		elif client_id:
			print("error : RoomJoinView, Double client_id")
			return JsonResponse({'Error' : 'Can not request several time in same browser'})

		if room.QuantityPlayer < 4 and not client_id:
			room.QuantityPlayer += 1
			room.save()
			client_id = create_new_uuid()
			Nclient = self.check_client_id_for_data(game_id, client_id)
			response = JsonResponse({'status': 'join', 'room_id' : game_id, 'room_name' : room.RoomName, 'quantity_player' : room.QuantityPlayer, 'quantity_player_ready' : room.QuantityPlayerReady, 'client_id': client_id, 'n_client': Nclient})			
			response.set_cookie('client_id', client_id)
			return response
		print("error: RoomJoinView, quantity player exceeds")
		return JsonResponse({'Error' : 'Quantity player exceeds the limit.'})
	
	@staticmethod
	def check_client_id_for_data(game_id, client_id):
		room = MultiRoomInfo.objects.get(Roomid=game_id)
		if not room.client1:
			instance = MultiRoomInfo.objects.get(Roomid=game_id)
			instance.client1 = {'client_id': client_id,  'ready_status':"not ready", 'paddle': None, 'online': True}
			instance.save()
			return "client1"
		elif not room.client2:
			instance = MultiRoomInfo.objects.get(Roomid=game_id)
			instance.client2 = {'client_id': client_id, 'ready_status':"not ready", 'paddle': None, 'online': True}
			instance.save()
			return "client2"
		elif not room.client3:
			instance = MultiRoomInfo.objects.get(Roomid=game_id)
			instance.client3 = {'client_id': client_id, 'ready_status':"not ready", 'paddle': None, 'online': True}
			instance.save()
			return "client3"
		elif not room.client4:
			instance = MultiRoomInfo.objects.get(Roomid=game_id)
			instance.client4 = {'client_id': client_id, 'ready_status':"not ready", 'paddle': None, 'online': True}
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
		if room.client1['client_id'] == client_id:
			room.client1 = None
		elif room.client2['client_id'] == client_id:
			room.client2 = None
		elif room.client3['client_id'] == client_id:
			room.client3 = None
		elif room.client4['client_id'] == client_id:
			room.client4 = None
		room.save()

# class GameStartView(View):
# 	def get(self, request, game_id):
# 		layer = get_channel_layer()
# 		print(game_id)
# 		print(layer)
# 		layer.group_add(game_id, 'websocket.consumer.channel_name')
# 		layer.group_send(game_id, {'Hi': 'hi'})
# 		return JsonResponse({})