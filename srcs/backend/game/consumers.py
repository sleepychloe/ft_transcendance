from channels.generic.websocket import AsyncWebsocketConsumer
from .models import MultiRoomInfo
from user.models import User42Info
from channels.db import database_sync_to_async
from django.db import transaction
import random
import json
import asyncio
import time
import os
import jwt
import re

class MultiGameConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(args, kwargs)
		self.client_id = None
		self.game_id = None
		self.game_data = None
		self.game_start = None
		self.thread = None

	async def make_dict_response(self, first, second, data):
		jsondata = await self.make_json_response(first, second, data)
		dictdata = await json.loads(jsondata)
		return dictdata

	async def make_json_response(self, first, second, data):
		jsondata = {}
		jsondata[first] = second
		jsondata['data'] = data
		ret = json.dumps(jsondata)
		return ret

	async def search_client_data(self):
		if self.game_data.client1['client_id'] == self.client_id:
			return 'client1'
		elif self.game_data.client2['client_id'] == self.client_id:
			return 'client2'
		elif self.game_data.client3['client_id'] == self.client_id:
			return 'client3'
		elif self.game_data.client4['client_id'] == self.client_id:
			return 'client4'
		return None

	async def connect(self):
		try:
			await self.accept()
			request_header = self.scope['headers']
			cookie_header = next((header for header in request_header if header[0] == b'cookie'), None)
			if cookie_header:
				cookies = cookie_header[1].decode('utf-8')
			match = re.search(r'client_id=([^;]*)', cookies)
			if match:
				self.client_id = match.group(1)
			else:
				await self.send(await self.make_json_response('info', 'error', {'error': 'Can not found your id!'}))
				self.close()
				return
			game_id = self.scope["url_route"]["kwargs"]["game_id"]
			self.game_id = game_id
			await self.get_game_data()
			if self.game_data.GameStatus == True:
				self.n_client = await self.search_client_data()
				if self.n_client == None:
					await self.send(await self.make_json_response('info', 'error', {'error': 'Can not found your id!'}))
					self.close()
					return
				await self.channel_layer.group_add(game_id, self.channel_name)
				await self.reconnect_client_quantity()
				await self.get_game_data()
				await self.channel_layer.group_send(self.game_id,
														{
															'type': 'room_inform',
															'action': 'reconnect',
															'quantity_player': self.game_data.QuantityPlayer,
															'quantity_player_ready': self.game_data.QuantityPlayerReady,
															'n_client': self.n_client,
															'sender_channel_name': self.channel_name,
														})
				player_info = await self.get_value_game_data(self.n_client)
				self.number_paddle = player_info["paddle"]
				await self.init_game_value()
			else:
				if await self.search_client_data() == None:
					await self.send(await self.make_json_response('info', 'error', {'error': 'Can not found your id!'}))
					self.close()
				await self.initialize_game()
				await self.channel_layer.group_add(game_id, self.channel_name)
		except Exception as e:
			print("Something4 Error!", e)
			await self.send(await self.make_json_response('info', 'error', {'error': 'Can not found your id!'}))
			self.close()
			return
	@database_sync_to_async
	@transaction.atomic()
	def reconnect_client_quantity(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		game_data.QuantityPlayer += 1
		game_data.QuantityPlayerReady += 1
		if self.n_client == 'client1':
			game_data.client1['online'] = True
		elif self.n_client == 'client2':
			game_data.client2['online'] = True
		elif self.n_client == 'client3':
			game_data.client3['online'] = True
		elif self.n_client == 'client4':
			game_data.client4['online'] = True
		game_data.save()

	@database_sync_to_async
	def get_value_game_data(self, name):
		value = getattr(self.game_data, name, None)
		return value

	@database_sync_to_async
	@transaction.atomic()
	def update_value_game_data(self, name, value):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		setattr(game_data, name, value)
		game_data.save()

	@database_sync_to_async
	@transaction.atomic()
	def	remove_game_data(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		game_data.delete()

	async def disconnect(self, close_code):
		try:
			await self.get_game_data()
			if self.game_data.GameStatus == False:
				await self.remove_client_data()
				await self.get_game_data()
				if self.game_data.QuantityPlayer == 0:
					await self.remove_game_data()
			else:
				await self.update_value_game_data(self.number_paddle, {
					'x': -5000,
					'y': -5000,
				})
				await self.remove_client_data()
			await self.get_game_data()
			await self.channel_layer.group_send(self.game_id,
													{
														'type': 'room_inform',
														'action': 'disconnect',
														'n_client': self.n_client,
														'quantity_player': self.game_data.QuantityPlayer,
														'quantity_player_ready': self.game_data.QuantityPlayerReady,
														'sender_channel_name': self.channel_name,
													})
			await self.channel_layer.group_discard(self.game_id, self.channel_name)
		except Exception as e:
			print("Something1 Wrong!", e)
			self.close()

	@database_sync_to_async
	@transaction.atomic()
	def remove_client_data(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if game_data.GameStatus == False:
			if game_data.client1:
				if game_data.client1['client_id'] == self.client_id:
					if game_data.client1['ready_status'] == 'ready':
						game_data.QuantityPlayerReady -= 1
					game_data.client1 = {}
			if game_data.client2:
				if game_data.client2['client_id'] == self.client_id:
					if game_data.client2['ready_status'] == 'ready':
						game_data.QuantityPlayerReady -= 1
					game_data.client2 = {}
			if game_data.client3:
				if game_data.client3['client_id'] == self.client_id:
					if game_data.client3['ready_status'] == 'ready':
						game_data.QuantityPlayerReady -= 1
					game_data.client3 = {}
			if game_data.client4:
				if game_data.client4['client_id'] == self.client_id:
					if game_data.client4['ready_status'] == 'ready':
						game_data.QuantityPlayerReady -= 1
					game_data.client4 = {}

			if self.number_paddle == 'paddle1':
				game_data.paddle1 = {}
			elif self.number_paddle == 'paddle2':
				game_data.paddle2 = {}
			elif self.number_paddle == 'paddle3':
				game_data.paddle3 = {}
			elif self.number_paddle == 'paddle4':
				game_data.paddle4 = {}
		else:
			game_data.QuantityPlayerReady -= 1
			if game_data.client1['client_id'] == self.client_id:
				game_data.client1['online'] = False
			elif game_data.client2['client_id'] == self.client_id:
				game_data.client2['online'] = False
			elif game_data.client3['client_id'] == self.client_id:
				game_data.client3['online'] = False
			elif game_data.client4['client_id'] == self.client_id:
				game_data.client4['online'] = False
		game_data.QuantityPlayer -= 1
		game_data.save()

	@database_sync_to_async
	def get_game_data(self):
		try:
			with transaction.atomic():
				self.game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		except Exception as e:
			print("Wrong Url ! (can not match game id)", e)
			self.send(self.make_json_response('info', 'error', {'error': 'Wrong Url ! (can not match game id)'}))
			self.close()

	@database_sync_to_async
	def init_game_value2(self):
		self.get_game_data()
		self.ball_speed = 8
		random.seed(time.time())
		self.vx = self.ball_speed * random.uniform(-1, 1)
		self.vy = self.ball_speed * random.uniform(-1, 1)
		while self.vx < 2 and self.vx > -2:
			self.vx = self.ball_speed * random.uniform(-1, 1)

		while ((self.vy > 10 and self.vy < -10) and 
			(self.vy < 5 and self.vy > -5)):
			self.vx = self.ball_speed * random.uniform(-1, 1)

		self.game_state = {
			'ball': {
				'x': 400,
				'y': 200,
			}
		}
		if self.game_data.GameStatus == False:
			self.score = {
			'score': {
				'left': 0,
				'right': 0,
			}
		}
	
	@database_sync_to_async
	def init_game_value(self):
		self.get_game_data()
		self.ball_speed = 8
		random.seed(time.time())
		self.vx = self.ball_speed * random.uniform(-1, 1)
		self.vy = self.ball_speed * random.uniform(-1, 1)
		while self.vx < 2 and self.vx > -2:
			self.vx = self.ball_speed * random.uniform(-1, 1)

		while ((self.vy > 10 and self.vy < -10) and 
			(self.vy < 5 and self.vy > -5)):
			self.vx = self.ball_speed * random.uniform(-1, 1)

		self.game_state = {
			'ball': {
				'x': 400,
				'y': 200,
			}
		}
		self.init_game_paddle_data()
		self.score = {
			'score': {
				'left': 0,
				'right': 0,
			}
		}

	@database_sync_to_async
	@transaction.atomic()
	def reset_game_paddle_value(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if game_data.paddle1 != None:
			game_data.paddle1 = {
				'x': 0,
				'y': 100,
			}
		if game_data.paddle2 != None:
			game_data.paddle2 = {
				'x': 0,
				'y': 300,
	 			}
		if game_data.paddle3 != None:
			game_data.paddle3 = {
				'x': 790,
				'y': 100		
			}
		if game_data.paddle4 != None:
			game_data.paddle4 = {
				'x': 790,
				'y': 300,
			}
		game_data.save()


	@transaction.atomic()
	def init_game_paddle_data(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if self.number_paddle == 'paddle1':
			game_data.paddle1 = {
				'x': 0,
				'y': 100,
			}
		elif self.number_paddle == 'paddle2':
			game_data.paddle2 = {
				'x': 0,
				'y': 300,
		 		}
		elif self.number_paddle == 'paddle3':
			game_data.paddle3 = {
				'x': 790,
				'y': 100		
			}
		elif self.number_paddle == 'paddle4':
			game_data.paddle4 = {
				'x': 790,
				'y': 300,
			}
		game_data.save()

	@database_sync_to_async
	@transaction.atomic()
	def init_game_paddle(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if not game_data.paddle1:
			self.number_paddle = 'paddle1'
			game_data.client1['paddle'] = 'paddle1'
		elif not game_data.paddle2:
			self.number_paddle = 'paddle2'
			game_data.client2['paddle'] = 'paddle2'
		elif not game_data.paddle3:
			self.number_paddle = 'paddle3'
			game_data.client3['paddle'] = 'paddle3'
		elif not game_data.paddle4:
			self.number_paddle = 'paddle4'
			game_data.client4['paddle'] = 'paddle4'
		else:
			self.send(self.make_json_response('info', 'error', {'error': 'Can not found your id!'}))
			self.close()
		game_data.save()

	@database_sync_to_async
	@transaction.atomic()
	def init_n_client(self):
		try:
			game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
			if game_data.client1['client_id'] == self.client_id:
				self.n_client = 'client1'
			elif game_data.client2['client_id'] == self.client_id:
				self.n_client = 'client2'
			elif game_data.client3['client_id'] == self.client_id:
				self.n_client = 'client3'
			elif game_data.client4['client_id'] == self.client_id:
				self.n_client = 'client4'
		except Exception as e:
			print("Somthing Wrong!", e)

	async def initialize_game(self):
		await self.init_n_client()
		await self.init_game_paddle()
		await self.init_game_value()

	@database_sync_to_async
	@transaction.atomic()
	def player_ready(self, n_client):
		try:
			game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
			if n_client == 'client1':
				game_data.client1['ready_status'] = "ready"
			elif n_client == 'client2':
				game_data.client2['ready_status'] = "ready"
			elif n_client == 'client3':
				game_data.client3['ready_status'] = "ready"
			elif n_client == 'client4':
				game_data.client4['ready_status'] = "ready"
			game_data.QuantityPlayerReady += 1
			game_data.save()
		except Exception as e:
			print("Something3 Error!", e)
			self.close()

	@database_sync_to_async
	@transaction.atomic()
	def player_unready(self, n_client):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if n_client == 'client1':
			game_data.client1['ready_status'] = "not ready"
		elif n_client == 'client2':
			game_data.client2['ready_status'] = "not ready"
		elif n_client == 'client3':
			game_data.client3['ready_status'] = "not ready"
		elif n_client == 'client4':
			game_data.client4['ready_status'] = "not ready"
		game_data.QuantityPlayerReady -= 1
		game_data.save()

	async def check_user_all_ready(self):
		if not (self.game_data.client1 and self.game_data.client2 and self.game_data.client3 and self.game_data.client4):
			return
		if (self.game_data.client1['ready_status'] == 'ready' and self.game_data.client2['ready_status'] == 'ready' and 
			self.game_data.client3['ready_status'] == 'ready' and self.game_data.client4['ready_status'] == 'ready'):
			await self.channel_layer.group_send(self.game_id,
													{
														'type': 'game_status',
														'action': 'start',
														'data': {},
														'sender_channel_name': self.channel_name,
													})
			await self.save_game_start_status(True)
			asyncio.create_task(self.ball_move_thread())

	@database_sync_to_async
	@transaction.atomic()
	def save_game_start_status(self, status):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		game_data.GameStatus = status
		game_data.save()

	async def receive(self, text_data=None, bytes_data=None):
		try:
			await self.get_game_data()
			text_data_json = json.loads(text_data)
			action = text_data_json.get('action')

			if action == 'update':
				type = text_data_json.get('type')
				data = text_data_json.get('data')
				if type == 'ready_status':
					await self.player_ready(self.n_client)
					await self.get_game_data()
					await self.channel_layer.group_send(self.game_id,
														{
															'type': 'room_inform',
															'action': 'ready',
															'n_client': self.n_client,
															'quantity_player': self.game_data.QuantityPlayer,
															'quantity_player_ready': self.game_data.QuantityPlayerReady,
															'sender_channel_name': self.channel_name,
														})
					await self.check_user_all_ready()
				elif type == 'unready_status':
					await self.player_unready(self.n_client)
					await self.get_game_data()
					await self.channel_layer.group_send(self.game_id,
														{
															'type': 'room_inform',
															'action': 'unready',
															'n_client': self.n_client,
															'quantity_player': self.game_data.QuantityPlayer,
															'quantity_player_ready': self.game_data.QuantityPlayerReady,
															'sender_channel_name': self.channel_name,
														})
				elif type == 'player_info':
					await self.channel_layer.group_send(self.game_id,
														{
															'type': 'room_inform',
															'action': 'join',
															'n_client': self.n_client,
															'quantity_player': self.game_data.QuantityPlayer,
															'quantity_player_ready': self.game_data.QuantityPlayerReady,
															# 'intra_id': self.intra_id,
															# 'user_avatar': self.avatar,
															'sender_channel_name': self.channel_name,
														})
				else:
					await self.send(await self.make_json_response('info', 'error', {'error': 'Type is undefined!'}))
			elif action == 'move_paddle':
				direction = text_data_json.get('direction')
				await self.move_paddle(direction)
			else:
				await self.send(await self.make_json_response('info', 'error', {'error': 'There is nothings to do!'}))
		except Exception as e:
			print("Something2 Wrong!", e)
			self.close()

	# broadcasting for game event: ex. start/end
	async def game_status(self, event):
		action = event['action']
		data = event['data']

		if action == 'start':
			await self.send(text_data=json.dumps({
					'info': 'game',
					'type': 'start',
					'data': {},
				}))
		elif action == 'update':
			await self.send(text_data=json.dumps({
					'info': 'game',
					'type': 'position',
					'data': data,
				}))
		elif action == 'finish':
			await self.get_game_data()
			await self.send(text_data=json.dumps({
					'info': 'game',
					'type': 'finish',
					'data': {
						"room_id": self.game_data.Roomid,
						"quantity_player" : self.game_data.QuantityPlayer,
					},
			}))


	# broadcasting for room event: ex. join/ready
	async def room_inform(self, event):
		quantity_player_ready = event['quantity_player_ready']
		quantity_player = event['quantity_player']
		n_client = event['n_client']
		action = event['action']
		if self.channel_name != event['sender_channel_name']:
			if action == 'join':
				await self.send(text_data=json.dumps({
					'info': 'player',
					'type': 'join',
					'data': {
						'n_client': n_client,
						'quantity_player': quantity_player,
						'quantity_player_ready': quantity_player_ready,
						'room_id': self.game_id
					},
				}))
		if action == 'ready':
			await self.send(text_data=json.dumps({
				'info': 'player',
				'type': 'ready',
				'data': {
					'n_client': n_client,
					'quantity_player': quantity_player,
					'quantity_player_ready': quantity_player_ready,
				},
			}))
		elif action == 'unready':
			await self.send(text_data=json.dumps({
				'info': 'player',
				'type': 'unready',
				'data': {
					'n_client': n_client,
					'quantity_player': quantity_player,
					'quantity_player_ready': quantity_player_ready,
				},
			}))
		elif action == 'disconnect':
			await self.send(text_data=json.dumps({
				'info': 'player',
				'type': 'disconnect',
				'data': {
					'n_client': n_client,
					'quantity_player': quantity_player,
					'quantity_player_ready': quantity_player_ready,
					'room_id': self.game_id
				}
			}))
		elif action == 'reconnect':
			await self.send(text_data=json.dumps({
				'info': 'player',
				'type': 'reconnect',
				'data': {
					'n_client': n_client,
					'quantity_player': quantity_player,
					'quantity_player_ready': quantity_player_ready,
					'room_id': self.game_id
				}
			}))

	@database_sync_to_async
	@transaction.atomic()
	def move_paddle(self, direction):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if self.number_paddle == 'paddle1':
			if direction == 'down' and game_data.paddle1['y'] < 350:
				game_data.paddle1['y'] += 10
			elif direction == 'up' and game_data.paddle1['y'] > 0:
				game_data.paddle1['y'] -= 10
		if self.number_paddle == 'paddle2':
			if direction == 'down' and game_data.paddle2['y'] < 350:
				game_data.paddle2['y'] += 10
			elif direction == 'up' and game_data.paddle2['y'] > 0:
				game_data.paddle2['y'] -= 10
		if self.number_paddle == 'paddle3':
			if direction == 'down' and game_data.paddle3['y'] < 350:
				game_data.paddle3['y'] += 10
			elif direction == 'up' and game_data.paddle3['y'] > 0:
				game_data.paddle3['y'] -= 10
		if self.number_paddle == 'paddle4':
			if direction == 'down' and game_data.paddle4['y'] < 350:
				game_data.paddle4['y'] += 10
			elif direction == 'up' and game_data.paddle4['y'] > 0:
				game_data.paddle4['y'] -= 10
		game_data.save()

	@database_sync_to_async
	@transaction.atomic()
	def remove_paddle_data(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if game_data.client1['online'] == False:
			paddle = game_data.client1['paddle']
			if 'paddle1' == paddle:
				game_data.paddle1 = None
			elif 'paddle2' == paddle:
				game_data.paddle2 = None
			elif 'paddle3' == paddle:
				game_data.paddle3 = None
			elif 'paddle4' == paddle:
				game_data.paddle4 = None
		if game_data.client2['online'] == False:
			paddle = game_data.client2['paddle']
			if 'paddle1' == paddle:
				game_data.paddle1 = None
			elif 'paddle2' == paddle:
				game_data.paddle2 = None
			elif 'paddle3' == paddle:
				game_data.paddle3 = None
			elif 'paddle4' == paddle:
				game_data.paddle4 = None
		if game_data.client3['online'] == False:
			paddle = game_data.client3['paddle']
			if 'paddle1' == paddle:
				game_data.paddle1 = None
			elif 'paddle2' == paddle:
				game_data.paddle2 = None
			elif 'paddle3' == paddle:
				game_data.paddle3 = None
			elif 'paddle4' == paddle:
				game_data.paddle4 = None
		if game_data.client4['online'] == False:
			paddle = game_data.client4['paddle']
			if 'paddle1' == paddle:
				game_data.paddle1 = None
			elif 'paddle2' == paddle:
				game_data.paddle2 = None
			elif 'paddle3' == paddle:
				game_data.paddle3 = None
			elif 'paddle4' == paddle:
				game_data.paddle4 = None
		game_data.save()

	@database_sync_to_async
	@transaction.atomic()
	def player_status_check(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if game_data.client1['online'] == True:
			game_data.client1['ready_status'] = 'not ready'
			game_data.QuantityPlayerReady -= 1
		else:
			game_data.client1 = {}

		if game_data.client2['online'] == True:
			game_data.client2['ready_status'] = 'not ready'
			game_data.QuantityPlayerReady -= 1
		else:
			game_data.client2 = {}

		if game_data.client3['online'] == True:
			game_data.client3['ready_status'] = 'not ready'
			game_data.QuantityPlayerReady -= 1
		else:
			game_data.client3 = {}

		if game_data.client4['online'] == True:
			game_data.client4['ready_status'] = 'not ready'
			game_data.QuantityPlayerReady -= 1
		else:
			game_data.client4 = {}

		game_data.save()

	@database_sync_to_async
	@transaction.atomic()
	def check_quantity_and_delete_game(self):
		game_data = MultiRoomInfo.objects.select_for_update().get(Roomid=self.game_id)
		if game_data.QuantityPlayer == 0:
			game_data.delete()

	async def ball_move_thread(self):
		await self.get_game_data()
		while self.game_data.GameStatus == True:
			self.game_state['ball']['x'] += self.vx
			self.game_state['ball']['y'] += self.vy
			await self.paddle_ball_collision()
			if (self.game_state['ball']['x'] <= 0 or self.game_state['ball']['x'] >= 800):
				if self.game_state['ball']['x'] <= 0:
					self.score['score']['right'] += 1
				else:
					self.score['score']['left'] += 1
				if (self.score['score']['right'] > 2 or self.score['score']['left'] > 2):
					self.score['score']['right'] = 0
					self.score['score']['left'] = 0
					try:
						await self.remove_paddle_data()
						await self.player_status_check()
						await self.save_game_start_status(False)
					except Exception as e:
						print('error',e.__class__.__name__)
						print('message', str(e))
					break
				# await self.init_game_value(self)
				self.ball_speed += 1
				self.vx = self.ball_speed * random.uniform(-1, 1)
				self.vy = self.ball_speed * random.uniform(-1, 1)
				while self.vx < 2 and self.vx > -2:
					self.vx = self.ball_speed * random.uniform(-1, 1)
				while ((self.vy > 10 and self.vy < -10) and 
						(self.vy < 5 and self.vy > -5)):
					self.vx = self.ball_speed * random.uniform(-1, 1)
				self.game_state = {
					'ball': {
						'x': 400,
						'y': 200,
					}
				}
			if self.game_state['ball']['y'] <= 0 or self.game_state['ball']['y'] >= 400:
				self.vy = -self.vy
			paddle_position = {
				'paddle1' : self.game_data.paddle1,
				'paddle2' : self.game_data.paddle2,
				'paddle3' : self.game_data.paddle3,
				'paddle4' : self.game_data.paddle4,
			}
			paddle_position.update(self.game_state)
			paddle_position.update(self.score)
			await self.channel_layer.group_send(self.game_id,
													{
														'type': 'game_status',
														'action': 'update',
														'data': paddle_position,
														'sender_channel_name': self.channel_name,
													})
			await asyncio.sleep(0.015)
			await self.get_game_data()
		#out of scope while
		await self.init_game_value2()
		await self.reset_game_paddle_value()
		await self.get_game_data()
		await self.channel_layer.group_send(self.game_id,
												{
													'type': 'game_status',
													'action': 'finish',
													'data': {},
													'sender_channel_name': self.channel_name,
												})
		await self.check_quantity_and_delete_game()

	async def paddle_ball_collision(self):
		left_paddle1 = self.game_data.paddle1
		left_paddle2 = self.game_data.paddle2
		right_paddle3 = self.game_data.paddle3
		right_paddle4 = self.game_data.paddle4
		ball_x = self.game_state['ball']['x']
		ball_y = self.game_state['ball']['y']
		paddle_width = 10
		paddle_height = 50
		canvas_width = 800
		if ((ball_x <= paddle_width and ball_y >= left_paddle1['y'] and ball_y <= left_paddle1['y'] + paddle_height) or 
			(ball_x <= paddle_width and ball_y >= left_paddle2['y'] and ball_y <= left_paddle2['y'] + paddle_height)) :
			self.vx = -self.vx
			self.vx += 0.1
		if ((ball_x >= canvas_width - paddle_width and ball_y >= right_paddle3['y'] and ball_y <= right_paddle3['y'] + paddle_height) or
			(ball_x >= canvas_width - paddle_width and ball_y >= right_paddle4['y'] and ball_y <= right_paddle4['y'] + paddle_height)) :
			self.vx = -self.vx
			self.vx -= 0.1
