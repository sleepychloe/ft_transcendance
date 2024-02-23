from channels.generic.websocket import AsyncWebsocketConsumer
from django.http import JsonResponse
from .models import MultiRoomInfo
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
import random
import http.cookies
import json
import threading
import time

class MultiGameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.client_id = None
        self.game_id = None
        self.game_data = None
        self.game_start = None

    async def make_json_response(self, first, second, data):
        jsondata = {}
        jsondata[first] = second
        jsondata['data'] = data
        ret = json.dumps(jsondata)
        return ret

    async def connect(self):
        await self.accept()
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
        self.game_start = False
        self.initialize_game()
        self.channel_layer.group_add(game_id, self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.game_id, self.channel_name)

    @database_sync_to_async
    def get_game_data(self):
        try :
            self.game_data = MultiRoomInfo.objects.get(Roomid=self.game_id)
        except MultiRoomInfo.DoesNotExist:
            self.send(self.make_json_response('info', 'error', {'error': 'Wrong Url ! (can not match game id)'}))
            self.close()

    @database_sync_to_async
    def init_game_value(self):
        self.game_state = {
            'ball': {
                'x': 400,
                'y': 200,
                'vx': 2 + 1.5 * random.random(),
                'vy': 2 + 1.5 * random.random(),
            },
            self.game_data.paddle1: {
                'x': 0,
                'y': 150,
            },
            self.game_data.paddle2: {
                'x': 20,
                'y': 150,
            },
            self.game_data.paddle3: {
                'x': 790,
                'y': 150,
            },
            self.game_data.paddle4: {
                'x': 770,
                'y': 150,
            },
        }
        if self.game_start == False:
            self.game_score = {
                'left': 0,
                'right': 0,
            },

    @database_sync_to_async
    def init_game_paddle(self):
        if self.game_data.paddle1 == None:
             self.game_data.paddle1 = self.client_id
        elif self.game_data.paddle2 == None:
             self.game_data.paddle2 = self.client_id
        elif self.game_data.paddle3 == None:
             self.game_data.paddle3 = self.client_id
        elif self.game_data.paddle4 == None:
             self.game_data.paddle4 = self.client_id
        self.game_data.save()

    async def initialize_game(self):
        await self.init_game_paddle(self)
        await self.init_game_value(self)
        await self.init_game_state(self)

    
    async def init_thread_ball(self):
        self.thread = threading.Thread(target=ball_move_thread, args=[self])
        self.thread.setDaemon(True)

    async def init_game_state(self):
        if self.game_data.paddle1 and self.game_data.paddle2 and self.game_data.paddle3 and self.game_data.paddle4:
            self.init_thread_ball()
            await self.send((await self.make_json_response('game_status', 'wait', self.game_state + self.game_score)))

    @database_sync_to_async
    def change_user_status(self, n_client):
        if n_client == 'client1':
            self.game_data.client1['ready_status'] = "ready"
        elif n_client == 'client2':
            self.game_data.client2['ready_status'] = "ready"
        elif n_client == 'client3':
            self.game_data.client3['ready_status'] = "ready"
        elif n_client == 'client4':
            self.game_data.client4['ready_status'] = "ready"
        self.game_data.save()

    @database_sync_to_async
    def check_user_all_ready(self):
        if (self.game_data.client1['ready_status'] == 'ready' and self.game_data.client2['ready_status'] == 'ready' and 
            self.game_data.client3['ready_status'] == 'ready' and self.game_data.client4['ready_status'] == 'ready'):
            self.send(self.make_json_response('game_status', 'start', {}))
            time.sleep(3)
            self.thread.start()
            self.game_start = True

    async def send_game_state(self):
        await self.channel_layer.group_send(await self.make_json_response('info', 'ball', self.game_state))

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if action == 'update':
            type = text_data_json.get('type')
            data = text_data_json.get('data')
            if type == 'user_status':
                n_client = data['n_client']
                await self.change_user_status(n_client)
                await self.send(await self.make_json_response('info', 'ready_status', {'ready_status': 'ok', 'n_client': n_client}))
                await self.check_user_all_ready()
            if type == 'user_info':
                pass
                # parse data here { client_id, n_client }
        elif action == 'move_paddle' and self.game_start == True:
                direction = text_data_json.get('direction')
                await self.move_paddle(direction)
                self.send_game_state(self)
        else:
            await self.send(await self.make_json_response('info', 'error', {'error': 'There is nothings to do!'}))

    async def move_paddle(self, direction):
        if direction == 'down':
            if self.game_state[self.client_id]['y'] < 300:
                self.game_state[self.client_id]['y'] += 15
        elif direction == 'up':
            if self.game_state[self.client_id]['y'] > 0:
                self.game_state[self.client_id]['y'] -= 15
        else:
            await self.send(await self.make_json_response('info', 'error', {'error': 'Can not understand paddle direction !'}))

def ball_move_thread(self):
    while True:
        time.sleep(0.05)
        paddle_ball_collision(self)
        self.game_state['ball']['x'] += self.game_state['ball']['vx']
        self.game_state['ball']['y'] += self.game_state['ball']['vy']
        if self.game_state['ball']['x'] <= 0 or self.game_state['ball']['x'] >= 800:
            if self.game_state['ball']['x'] <= 0:
                self.game_score['right'] += 1
            else:
                self.game_score['left'] += 1
            self.init_game_value(self)
        if self.game_state['ball']['y'] <= 0 or self.game_state['ball']['y'] >= 400:
           self.game_state['ball']['vy'] = -self.game_state['ball']['vy']
        self.channel_layer.group_send(self.make_json_response('info', 'ball', self.game_state))

def paddle_ball_collision(self):
    left_paddle1 = self.game_data.paddle1
    left_paddle2 = self.game_data.paddle2
    right_paddle3 = self.game_data.paddle3
    right_paddle4 = self.game_data.paddle4
    ball_x = self.game_state['ball']['x']
    ball_y = self.game_state['ball']['y']
    paddle_width = 10
    paddle_height = 100
    canvas_width = 800
    if ((ball_x < paddle_width and ball_y > left_paddle1['y'] and ball_y < left_paddle1['y'] + paddle_height) or 
        (ball_x + 20 < paddle_width and ball_y > left_paddle2['y'] and ball_y < left_paddle2['y'] + paddle_height) or
        (ball_x > canvas_width - paddle_width and ball_y > right_paddle3['y'] and ball_y < right_paddle3['y'] + paddle_height) or
        (ball_x - 20 > canvas_width - paddle_width and ball_y > right_paddle4['y'] and ball_y < right_paddle4['y'] + paddle_height)) :
        self.game_state['ball']['vx'] = -self.game_state['ball']['vx']
