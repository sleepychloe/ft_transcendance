from channels.generic.websocket import AsyncWebsocketConsumer
from django.http import JsonResponse
from .models import MultiRoomInfo
from asgiref.sync import async_to_sync
import random
import http.cookies
import json
import threading
import time

class MultiGameConsumer(AsyncWebsocketConsumer):
    async def connect(self, game_id):
        raw_cookies = self.scope.get('headers', {}).get(b'cookie', b'').decode('utf-8')
        cookies = http.cookies.SimpleCookie(raw_cookies)
        client_id = cookies.get('client_id').value if 'client_id' in cookies else None
        if client_id == None:
            return JsonResponse({'Error': 'there is no client id in cookie.'})
        self.client_id = client_id
        self.accept()
        self.initialize_game(game_id)
        self.channel_layer.group_add(game_id, self.channel_name)

    async def disconnect(self, game_id, close_code):
        self.channel_layer.group_discard(game_id, self.channel_name)
        pass

    async def init_game_value(self, game_id):
        try :
            game_data = MultiRoomInfo.objects.get(RoomName=game_id)
        except MultiRoomInfo.DoesNotExist:
             self.send(text_data=json.dumps({'Error': 'Game id URL is not exists in init_game_value'}))
        self.game_state = {
            'ball': {
                'x': 400,
                'y': 200,
                'vx': 2 + 1.5 * random.random(),
                'vy': 2 + 1.5 * random.random(),
            },
            game_data.paddle1: {
                'x': 0,
                'y': 150,
            },
            game_data.paddle2: {
                'x': 20,
                'y': 150,
            },
            game_data.paddle3: {
                'x': 800,
                'y': 150,
            },
            game_data.paddle4: {
                'x': 780,
                'y': 150,
            },
        }


    async def init_game_paddle(self, game_id):
        try :
            game_data = MultiRoomInfo.objects.get(RoomName=game_id)
        except MultiRoomInfo.DoesNotExist:
             self.send(text_data=json.dumps({'Error': 'Game id URL is not exists in init_game_paddle'}))
        if self.client_id == None:
             return self.send(json.dumps({'Error': 'Client id is not exists'}))
        if game_data.paddle1 == None:
             game_data.paddle1 = self.client_id
             game_data.save()
        elif game_data.paddle2 == None:
             game_data.paddle2 = self.client_id
             game_data.save()
        elif game_data.paddle3 == None:
             game_data.paddle3 = self.client_id
             game_data.save()
        elif game_data.paddle4 == None:
             game_data.paddle4 = self.client_id
             game_data.save()

    async def initialize_game(self, game_id):
        self.init_game_paddle(self, game_id)
        self.init_game_value(self, game_id)
        self.send_game_state(self, game_id)

    
    async def init_thread_ball(self):
        self.thread = threading.Thread(target=ball_move_thread, args=[self])
        self.thread.setDaemon(True)

    async def send_game_state(self, game_id):
        try :
            game_data = MultiRoomInfo.objects.get(RoomName=game_id)
        except MultiRoomInfo.DoesNotExist:
             self.send(text_data=json.dumps({'Error': 'Game id URL is not exists in init_game_paddle'}))
        if game_data.paddle1 and game_data.paddle2 and game_data.paddle3 and game_data.paddle4:
            self.init_thread_ball()
            self.send(text_data=json.dumps({'type': 'game_state', 'data': self.game_state}))

    # async def update_game_state(self):
    #     # Update the ball's position based on its velocity
    #     self.game_state['ball']['x'] += self.game_state['ball']['vx']
    #     self.game_state['ball']['y'] += self.game_state['ball']['vy']

    #     # Boundary collision detection for an 800x600 canvas
    #     if self.game_state['ball']['x'] <= 0 or self.game_state['ball']['x'] >= 800:
    #         self.game_state['ball']['vx'] = -self.game_state['ball']['vx']
    #     if self.game_state['ball']['y'] <= 0 or self.game_state['ball']['y'] >= 400:
    #         self.game_state['ball']['vy'] = -self.game_state['ball']['vy']

    async def change_user_status(self, n_client, game_data):
        if n_client == 'client1':
            game_data.client1['ready_status'] = 1
        elif n_client == 'client2':
            game_data.client2['ready_status'] = 1
        elif n_client == 'client3':
            game_data.client3['ready_status'] = 1
        elif n_client == 'client4':
            game_data.client4['ready_status'] = 1
        game_data.save()


    async def check_user_all_ready(self, game_data):
        if game_data.client1['ready_status'] == 1 and game_data.client2['ready_status'] == 1 and game_data.client3['ready_status'] == 1 and game_data.client4['ready_status'] == 1:
            self.send(text_data=json.dumps({'game_start': 'ok'}))
            self.thread.start()

    async def receive(self, game_id, text_data=None, bytes_data=None):
        try :
            game_data = MultiRoomInfo.objects.get(RoomName=game_id)
        except MultiRoomInfo.DoesNotExist:
             self.send(text_data=json.dumps({'Error': 'Game id URL is not exists in init_game_paddle'}))
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        status = text_data_json.get('user_status')
        self.check_user_all_ready(self, game_data)

        if status == 'user_status':
            n_client = text_data_json.get('n_client')
            self.change_user_status(self, n_client, game_data)
        if action == 'move_paddle':
                direction = text_data_json.get('direction')
                self.move_paddle(direction)
                self.send_game_state()
        # elif action == 'update':
        #         self.update_game_state()
        #         self.send_game_state()
        else:
                print("Received unknown action:", action)

    async def move_paddle(self, direction, client_id):
        if direction == 'down':
            if self.game_state['paddle']['y'] < 300:
                self.game_state['paddle']['y'] += 10
        elif direction == 'up':
            if self.game_state['paddle']['y'] > 0:
                self.game_state['paddle']['y'] -= 10

def ball_move_thread(self):
    while True:
        time.sleep(0.05)
        self.game_state['ball']['x'] += self.game_state['ball']['vx']
        self.game_state['ball']['y'] += self.game_state['ball']['vy']
        if self.game_state['ball']['x'] <= 0 or self.game_state['ball']['x'] >= 800:
            self.game_state['ball']['vx'] = -self.game_state['ball']['vx']
        if self.game_state['ball']['y'] <= 0 or self.game_state['ball']['y'] >= 400:
           self.game_state['ball']['vy'] = -self.game_state['ball']['vy']
        self.channel_layer.group_send(self.game_state)
