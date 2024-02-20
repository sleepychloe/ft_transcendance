from channels.generic.websocket import AsyncWebsocketConsumer
from .models import MultiRoomInfo
import random
import http.cookies
import json

class MultiGameConsumer(AsyncWebsocketConsumer):
    async def connect(self, game_id):
        raw_cookies = self.scope.get('headers', {}).get(b'cookie', b'').decode('utf-8')
        cookies = http.cookies.SimpleCookie(raw_cookies)
        client_id = cookies.get('client_id').value if 'client_id' in cookies else None
        self.client_id = client_id
        self.accept()
        self.initialize_game(game_id)

    async def disconnect(self, close_code):
        pass

    async def init_game_value(self, game_id):
        # try :
        #     game_value_info = MultiRoomInfo.objects.get(RoomName=game_id)
        # except MultiRoomInfo.DoesNotExist:
        #      self.send(text_data=json.dumps({'Error': 'Game id URL is not exists'}))
        # quantity_player = game_value_info.QuantityPlayer
        self.game_state = {
            'ball': {
                'x': 400,
                'y': 200,
                'vx': 2 + 1.5 * random.random(),
                'vy': 2 + 1.5 * random.random(),
            },
            'paddle1': {
                'x': 0,
                'y': 150,
            },
            'paddle2': {
                'x': 20,
                'y': 150,
            },
            'paddle3': {
                'x': 800,
                'y': 150,
            },
            'paddle4': {
                'x': 780,
                'y': 150,
            },
        }
    async def initialize_game(self, game_id):
        self.init_game_value(self, game_id)
        self.send_game_state()

    async def send_game_state(self):
        self.send(text_data=json.dumps({'type': 'game_state', 'data': self.game_state}))

    async def update_game_state(self):
        # Update the ball's position based on its velocity
        self.game_state['ball']['x'] += self.game_state['ball']['vx']
        self.game_state['ball']['y'] += self.game_state['ball']['vy']

        # Boundary collision detection for an 800x600 canvas
        if self.game_state['ball']['x'] <= 0 or self.game_state['ball']['x'] >= 800:
            self.game_state['ball']['vx'] = -self.game_state['ball']['vx']
        if self.game_state['ball']['y'] <= 0 or self.game_state['ball']['y'] >= 400:
            self.game_state['ball']['vy'] = -self.game_state['ball']['vy']

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if action == 'move_paddle':
                direction = text_data_json.get('direction')
                self.move_paddle(direction)
                self.send_game_state()
        elif action == 'update':
                self.update_game_state()
                self.send_game_state()
        else:
                print("Received unknown action:", action)

    async def move_paddle(self, direction, client_id):
        if direction == 'down':
            if self.game_state['paddle']['y'] < 300:
                self.game_state['paddle']['y'] += 10
        elif direction == 'up':
            if self.game_state['paddle']['y'] > 0:
                self.game_state['paddle']['y'] -= 10

