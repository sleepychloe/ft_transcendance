from channels.generic.websocket import AsyncWebsocketConsumer
from .models import MultiRoomInfo
from channels.db import database_sync_to_async
import random
import json
import threading, asyncio
from asgiref.sync import sync_to_async

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

	async def connect(self):
		await self.accept()
		print(self.channel_name)
		request_header = self.scope['headers']
		cookie_header = next((header for header in request_header if header[0] == b'cookie'), None)
		if cookie_header:
			cookies = cookie_header[1].decode('utf-8')
		self.client_id = cookies.lstrip("client_id=")
		if self.client_id == cookies:
			await self.send(await self.make_json_response('info', 'error', {'error': 'Can not found your id!'}))
			self.close()
		game_id = self.scope["url_route"]["kwargs"]["game_id"]
		self.game_id = game_id
		await self.get_game_data()
		if self.game_data.GameStatus == True:
			#client id check 진행중인 사람이였는지
			await self.channel_layer.group_add(game_id, self.channel_name)
			await self.channel_layer.group_send(self.game_id,
													{
														'type': 'game_status',
														'action': 'reconnect',
														'client_id': self.client_id,
														'sender_channel_name': self.channel_name,
													})
		else:
			await self.initialize_game()
			await self.channel_layer.group_add(game_id, self.channel_name)
		# problem: game initializes only on connection
		# so already initialized informations are not getting updated:
		# 	first client has only information about 'first'
		#	second has information about 'first' and 'second'
		#	...
		# have to update game_state on player join

	async def disconnect(self, close_code):
		await self.channel_layer.group_send(self.game_id,
												{
													'type': 'room_inform',
													'action': 'disconnect',
													'client_id': self.client_id,
													'sender_channel_name': self.channel_name,
												})
		await print(self.game_data.GameStatus)
		if await self.game_data.GameStatus == False: #have to false for deploy
			await self.remove_client_data()
		await self.channel_layer.group_discard(self.game_id, self.channel_name)

	@database_sync_to_async
	def remove_client_data(self):
		if self.game_data.client1['client_id'] == self.client_id:
			self.game_data.client1 = None
		elif self.game_data.client2['client_id'] == self.client_id:
			self.game_data.client2 = None
		elif self.game_data.client3['client_id'] == self.client_id:
			self.game_data.client3 = None
		elif self.game_data.client4['client_id'] == self.client_id:
			self.game_data.client4 = None

		if self.number_paddle == 'paddle1':
			self.game_data.paddle1 = None
		elif self.number_paddle == 'paddle2':
			self.game_data.paddle2 = None
		elif self.number_paddle == 'paddle3':
			self.game_data.paddle3 = None
		elif self.number_paddle == 'paddle4':
			self.game_data.paddle4 = None
		self.game_data.QuantityPlayer -= 1
		self.game_data.save()

	@database_sync_to_async
	def get_game_data(self):
		try :
			self.game_data = MultiRoomInfo.objects.get(Roomid=self.game_id)
		except MultiRoomInfo.DoesNotExist:
			self.send(self.make_json_response('info', 'error', {'error': 'Wrong Url ! (can not match game id)'}))
			self.close()

	@database_sync_to_async
	def init_game_value(self):
		self.vx = 2 + 1.5 * random.random()
		self.vy = 2 + 1.5 * random.random()
		self.game_state = {
			'ball': {
				'x': 400,
				'y': 200,
			}
		}
		self.init_game_paddle_data()
		if self.game_data.GameStatus == False:
			self.game_score = {
				'left': 0,
				'right': 0,
			},

	def init_game_paddle_data(self):
		if self.number_paddle == 'paddle1':
			self.game_data.paddle1 = {
				'x': 0,
				'y': 100,
			}
		elif self.number_paddle == 'paddle2':
			self.game_data.paddle2 = {
				'x': 0,
				'y': 300,
			}
		elif self.number_paddle == 'paddle3':
			self.game_data.paddle3 = {
				'x': 790,
				'y': 100,
			}
		elif self.number_paddle == 'paddle4':
			self.game_data.paddle4 = {
				'x': 790,
				'y': 300,
			}
		self.game_data.save()

	@database_sync_to_async
	def init_game_paddle(self):
		if not self.game_data.paddle1:
			self.number_paddle = 'paddle1'
		elif not self.game_data.paddle2:
			self.number_paddle = 'paddle2'
		elif not self.game_data.paddle3:
			self.number_paddle = 'paddle3'
		elif not self.game_data.paddle4:
			self.number_paddle = 'paddle4'

	async def initialize_game(self):
		await self.init_game_paddle()
		print(self.number_paddle)
		await self.init_game_value()

	@database_sync_to_async
	def player_ready(self, n_client):
		if n_client == 'client1':
			self.game_data.client1['ready_status'] = "ready"
		elif n_client == 'client2':
			self.game_data.client2['ready_status'] = "ready"
		elif n_client == 'client3':
			self.game_data.client3['ready_status'] = "ready"
		elif n_client == 'client4':
			self.game_data.client4['ready_status'] = "ready"
		self.game_data.QuantityPlayerReady += 1
		self.game_data.save()

	@database_sync_to_async
	def player_unready(self, n_client):
		if n_client == 'client1':
			self.game_data.client1['ready_status'] = "not ready"
		elif n_client == 'client2':
			self.game_data.client2['ready_status'] = "not ready"
		elif n_client == 'client3':
			self.game_data.client3['ready_status'] = "not ready"
		elif n_client == 'client4':
			self.game_data.client4['ready_status'] = "not ready"
		self.game_data.QuantityPlayerReady -= 1
		self.game_data.save()

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
	def save_game_start_status(self, status):
		self.game_data.GameStatus = status
		self.game_data.save()

	async def receive(self, text_data=None, bytes_data=None):
		await self.get_game_data()
		text_data_json = json.loads(text_data)
		action = text_data_json.get('action')

		if action == 'update':
			type = text_data_json.get('type')
			data = text_data_json.get('data')
			if type == 'ready_status':
				n_client = data['n_client']
				await self.player_ready(n_client)
				await self.channel_layer.group_send(self.game_id,
													{
														'type': 'room_inform',
														'action': 'ready',
														'n_client': n_client,
														'quantity_player_ready': self.game_data.QuantityPlayerReady,
														'sender_channel_name': self.channel_name,
													})
				await self.check_user_all_ready()
			elif type == 'unready_status':
				n_client = data['n_client']
				await self.player_unready(n_client)
				await self.channel_layer.group_send(self.game_id,
													{
														'type': 'room_inform',
														'action': 'unready',
														'n_client': n_client,
														'quantity_player_ready': self.game_data.QuantityPlayerReady,
														'sender_channel_name': self.channel_name,
													})
			elif type == 'player_info':
				n_client = data['n_client']
				await self.channel_layer.group_send(self.game_id,
													{
														'type': 'room_inform',
														'action': 'join',
														'n_client': n_client,
														'quantity_player_ready': self.game_data.QuantityPlayerReady,
														'sender_channel_name': self.channel_name,
													})
			else:
				await self.send(await self.make_json_response('info', 'error', {'error': 'Type is undefined!'}))
		elif action == 'move_paddle':
			direction = text_data_json.get('direction')
			await self.move_paddle(direction)
			# await self.channel_layer.group_send(self.game_id,
			# 									{
			# 										'type': 'game_status',
			# 										'action': 'update',
			# 										'data': self.paddle_state,
			# 										'sender_channel_name': self.channel_name,
			# 									})
		else:
			await self.send(await self.make_json_response('info', 'error', {'error': 'There is nothings to do!'}))

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
			await self.send(text_data=json.dumps({
					'info': 'game',
					'type': 'finish',
					'data': {},
			}))


	# broadcasting for room event: ex. join/ready
	async def room_inform(self, event):
		quantity_player_ready = event['quantity_player_ready']
		n_client = event['n_client']
		action = event['action']
		if self.channel_name != event['sender_channel_name']:
			if action == 'join':
				await self.send(text_data=json.dumps({
					'info': 'player',
					'type': 'join',
					'data': {
						'n_client': n_client,
						'quantity_player_ready': quantity_player_ready,
					},
				}))
		if action == 'ready':
			await self.send(text_data=json.dumps({
				'info': 'player',
				'type': 'ready',
				'data': {
					'n_client': n_client,
					'quantity_player_ready': quantity_player_ready,
				},
			}))
		elif action == 'unready':
			await self.send(text_data=json.dumps({
				'info': 'player',
				'type': 'unready',
				'data': {
					'n_client': n_client,
					'quantity_player_ready': quantity_player_ready,
				},
			}))

	@database_sync_to_async
	def move_paddle(self, direction):
		if self.number_paddle == 'paddle1':
			if direction == 'down' and self.game_data.paddle1['y'] < 350:
				self.game_data.paddle1['y'] += 10
			elif direction == 'up' and self.game_data.paddle1['y'] > 0:
				self.game_data.paddle1['y'] -= 10
		if self.number_paddle == 'paddle2':
			if direction == 'down' and self.game_data.paddle2['y'] < 350:
				self.game_data.paddle2['y'] += 10
			elif direction == 'up' and self.game_data.paddle2['y'] > 0:
				self.game_data.paddle2['y'] -= 10
		if self.number_paddle == 'paddle3':
			if direction == 'down' and self.game_data.paddle3['y'] < 350:
				self.game_data.paddle3['y'] += 10
			elif direction == 'up' and self.game_data.paddle3['y'] > 0:
				self.game_data.paddle3['y'] -= 10
		if self.number_paddle == 'paddle4':
			if direction == 'down' and self.game_data.paddle4['y'] < 350:
				self.game_data.paddle4['y'] += 10
			elif direction == 'up' and self.game_data.paddle4['y'] > 0:
				self.game_data.paddle4['y'] -= 10
		self.game_data.save()

	async def ball_move_thread(self):
		await self.get_game_data()
		while self.game_data.GameStatus == True:
			print("in the while")
			self.game_state['ball']['x'] += self.vx
			self.game_state['ball']['y'] += self.vy
			await self.paddle_ball_collision()
			if (self.game_state['ball']['x'] <= 0 or self.game_state['ball']['x'] >= 800):
				if self.game_state['ball']['x'] <= 0:
					self.game_score[0]['right'] += 1
				else:
					self.game_score[0]['left'] += 1
				if (self.game_score[0]['right'] > 2 or self.game_score[0]['left'] > 2):
					await self.save_game_start_status(False)
					await self.player_unready('client1')
					await self.player_unready('client2')
					await self.player_unready('client3')
					await self.player_unready('client4')

				self.init_game_value(self)
				self.vx = 2 + 1.5 * random.random()
				self.vy = 2 + 1.5 * random.random()
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
			await self.channel_layer.group_send(self.game_id,
														{
															'type': 'game_status',
															'action': 'update',
															'data': paddle_position,
															'sender_channel_name': self.channel_name,
														})
			await asyncio.sleep(0.03)
			await self.get_game_data()
		#out of scope while
		print("out of while")
		await self.channel_layer.group_send(self.game_id,
											{
												'type': 'game_status',
												'action': 'finish',
												'quantity palyer_ready': self.game_data.QuantityPlayerReady,
												'sender_channel_name': self.channel_name,
											})

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
		if ((ball_x < paddle_width and ball_y > left_paddle1['y'] and ball_y < left_paddle1['y'] + paddle_height) or 
			(ball_x < paddle_width and ball_y > left_paddle2['y'] and ball_y < left_paddle2['y'] + paddle_height) or
			(ball_x > canvas_width - paddle_width and ball_y > right_paddle3['y'] and ball_y < right_paddle3['y'] + paddle_height) or
			(ball_x > canvas_width - paddle_width and ball_y > right_paddle4['y'] and ball_y < right_paddle4['y'] + paddle_height)) :
			self.vx = -self.vx
