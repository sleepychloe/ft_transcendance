import json
from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from game.models import MultiRoomInfo
from django.db import transaction
from django.conf import settings
from channels.layers import get_channel_layer
from django.utils.translation import get_language

translations = {
    'en': {
        'errUrlNotExists': "Game id URL is not exists",
        'errJoinAfterStart': "you can not join room after starting",
        'errShadowCloneJutsu': "it is impossible shadow clone jutsu",
        'errQuantityPlayerExceed': "Quantity of player exceeds the limit",
    },
    'fr': {
        'errUrlNotExists': "L'URL de l'identifiant du jeu n'existe pas",
        'errJoinAfterStart': "Vous ne pouvez pas rejoindre la salle après le début",
        'errShadowCloneJutsu': "Il est impossible de faire le jutsu du clone d'ombre",
        'errQuantityPlayerExceed': "Le nombre de joueurs dépasse la limite",
    },
    'ko': {
        'errUrlNotExists': "게임 ID URL이 존재하지 않습니다",
        'errJoinAfterStart': "시작한 후에는 방에 참여할 수 없습니다",
        'errShadowCloneJutsu': "그림자 복제술을 사용하는 것은 불가능합니다",
        'errQuantityPlayerExceed': "플레이어 수가 제한을 초과하였습니다",
    },
}

class TESTGameRoomDeleteView(View):

	@transaction.atomic
	def delete(self, request, game_id):
		if settings.DEBUG == True:
			room = MultiRoomInfo.objects.select_for_update().get(Roomid=game_id)
			room.delete()
			return JsonResponse({'status': 'delete ok'}, status=200)
		else:
			return JsonResponse({'status': 'delete ko'}, status=400)

def create_new_uuid():
	import uuid
	return str(uuid.uuid4()).replace("-", "")

class TESTGameRoomMakeView(View):

	@transaction.atomic
	def post(self, request):
		new_room_id = create_new_uuid()
		client_id = create_new_uuid()
		channel_layer = get_channel_layer()

		quantity_player = request.GET.get('quantity_player', 1)
		if MultiRoomInfo.objects.filter(Roomid=new_room_id).exists():
			return JsonResponse({'Error' : 'Game id already exists.'}, status=400)
		try:
			room_name = json.loads(request.body).get("room_name")
		except json.JSONDecodeError:
			return JsonResponse({'Error' : 'Roomname is not json.'}, status=400)
		new_data = MultiRoomInfo.objects.create(Roomid=new_room_id, RoomName=room_name,
										  QuantityPlayer=quantity_player, QuantityPlayerReady=0,
										  client1={'online': True, 'paddle': None, 'client_id':client_id,
					 					'ready_status': 'not ready'}, client2={}, client3={}, client4={}) # why this is called on client1 ready
		new_data.save()
		channel_layer.group_add(new_room_id, 'BACKEND')
		response = JsonResponse({'status': 'create', 'room_id' : new_room_id, 'client_id' : client_id,
						   'room_name' : room_name, 'quantity_player' : quantity_player,
						   'quantity_player_ready' : 0, 'n_client' : 'client1'}, status=200)
		response.set_cookie('client_id', client_id)
		return response

class TESTGameRoomListView(View):
	
	def get(self, request):
		all_data = MultiRoomInfo.objects.all()
		serialized_data = self.serialize_model_to_json(all_data)
		return JsonResponse(serialized_data, safe=False, status=200)

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
	
class TESTGameRoomJoinView(View):
	def search_client_data(self, room, client_id):
		if room.client1:
			if room.client1['client_id'] == client_id:
				return 'client1'
		if room.client2:
			if room.client2['client_id'] == client_id:
				return 'client2'
		if room.client3:
			if room.client3['client_id'] == client_id:
				return 'client3'
		if room.client4:
			if room.client4['client_id'] == client_id:
				return 'client4'
		return None

	@transaction.atomic
	def put(self, request, game_id):
         
		current_language = get_language()
		try:
			room = MultiRoomInfo.objects.select_for_update().get(Roomid=game_id)
		except MultiRoomInfo.DoesNotExist:
				error_message = translations.get(current_language)['errUrlNotExists']
				return JsonResponse({'Error': error_message}, status=400)
		client_id = request.COOKIES.get('client_id')
		if room.GameStatus == True:
			if client_id == None:
				error_message = translations.get(current_language)['errJoinAfterStart']
				return JsonResponse({'Error': error_message}, status=400)
			Nclient = self.search_client_data(room, client_id)
			if Nclient == None:
				print("error : RoomJoinView, GameStatus True, client_id None")
				error_message = translations.get(current_language)['errJoinAfterStart']
				return JsonResponse({'Error': error_message}, status=400)
			else:
				print('room_id', game_id, '\nroom_name', room.RoomName)
				return JsonResponse({'status': 'reconnect', 'room_id' : game_id, 'room_name' : room.RoomName, 'quantity_player' : room.QuantityPlayer, 'quantity_player_ready' : room.QuantityPlayerReady, 'client_id': client_id, 'n_client': Nclient})
		#if game status false
		if room.QuantityPlayer < 4:
			first_connection_flag = False
			if self.search_client_data(room, client_id) != None:
				error_message = translations.get(current_language)['errShadowCloneJutsu']
				return JsonResponse({'Error': error_message}, status=400)
			room.QuantityPlayer += 1
			room.save()
			if not client_id:
				client_id = create_new_uuid()
				first_connection_flag = True
			self.intra_id = "apitest"
			self.avatar = "/static/assets/img/user-person-single-id-account-player-male-female-512.webp"
			Nclient = self.check_client_id_for_data(game_id, client_id)
			response = JsonResponse({'status': 'join', 'room_id' : game_id, 'room_name' : room.RoomName, 'quantity_player' : room.QuantityPlayer, 'quantity_player_ready' : room.QuantityPlayerReady, 'client_id': client_id, 'n_client': Nclient})			
			if first_connection_flag == True:
				response.set_cookie('client_id', client_id)
			return response
		else:
			print("error: RoomJoinView, quantity player exceeds")
			error_message = translations.get(current_language)['errQuantityPlayerExceed']
			return JsonResponse({'Error': error_message}, status=400)
	
	@transaction.atomic
	def check_client_id_for_data(self, game_id, client_id):
		room = MultiRoomInfo.objects.select_for_update().get(Roomid=game_id)
		if not room.client1:
			room.client1 = {'client_id': client_id, 'ready_status':"not ready", 'paddle': None, 'online': True, 'intra_id' : self.intra_id, 'avatar':self.avatar}
			room.save()
			return "client1"
		elif not room.client2:
			room.client2 = {'client_id': client_id, 'ready_status':"not ready", 'paddle': None, 'online': True, 'intra_id' : self.intra_id, 'avatar':self.avatar}
			room.save()
			return "client2"
		elif not room.client3:
			room.client3 = {'client_id': client_id, 'ready_status':"not ready", 'paddle': None, 'online': True, 'intra_id' : self.intra_id, 'avatar':self.avatar}
			room.save()
			return "client3"
		elif not room.client4:
			room.client4 = {'client_id': client_id, 'ready_status':"not ready", 'paddle': None, 'online': True, 'intra_id' : self.intra_id, 'avatar':self.avatar}
			room.save()
			return "client4"
		
class TESTGameRoomMoveView(View):

	@transaction.atomic
	def put(self, request, game_id):
		try:
			room = MultiRoomInfo.objects.select_for_update().get(Roomid=game_id)
		except MultiRoomInfo.DoesNotExist:
				return JsonResponse({"Error":"can not find game id"}, status=400)
		try:
			body = json.loads(request.body)
		except Exception as e:
			print(e)
			return JsonResponse({"Error":"not form of json"}, status=400)
		if not (
			body['client_id'] and
			body['direction']
		):
			return JsonResponse({"Error":"json value error"}, status=400)
		
		if room.GameStatus == True:
			client_id = body['client_id']
			if room.client1['client_id'] == client_id:
				self.move_paddle(room.client1['paddle'], game_id, body['direction'])
			elif room.client2['client_id'] == client_id:
				self.move_paddle(room.client2['paddle'], game_id, body['direction'])
			elif room.client3['client_id'] == client_id:
				self.move_paddle(room.client3['paddle'], game_id, body['direction'])
			elif room.client4['client_id'] == client_id:
				self.move_paddle(room.client4['paddle'], game_id, body['direction'])
			else:
				return JsonResponse({"Error":"client_id does not exsits"}, status=400)
			return JsonResponse({"Status": "Ok", "client_id":client_id, "direction": body['direction']})
		else:
			return JsonResponse({"Error":"Game not yet start"}, status=400)
	
	@transaction.atomic
	def move_paddle(self, paddle, game_id, body):
		room = MultiRoomInfo.objects.select_for_update().get(Roomid=game_id)
		if paddle == 'paddle1':
			if body == 'down' and room.paddle1['y'] < 350:
				room.paddle1['y'] += 10
			elif body == 'up' and room.paddle1['y'] > 0:
				room.paddle1['y'] -= 10
		elif paddle == 'paddle2':
			if body == 'down' and room.paddle2['y'] < 350:
				room.paddle2['y'] += 10
			elif body == 'up' and room.paddle2['y'] > 0:
				room.paddle2['y'] -= 10
		elif paddle == 'paddle3':
			if body == 'down' and room.paddle3['y'] < 350:
				room.paddle3['y'] += 10
			elif body == 'up' and room.paddle3['y'] > 0:
				room.paddle3['y'] -= 10
		elif paddle == 'paddle4':
			if body == 'down' and room.paddle4['y'] < 350:
				room.paddle4['y'] += 10
			elif body == 'up' and room.paddle4['y'] > 0:
				room.paddle4['y'] -= 10
		room.save()