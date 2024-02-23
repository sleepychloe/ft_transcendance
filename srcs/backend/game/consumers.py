from channels.generic.websocket import AsyncWebsocketConsumer
from .models import MultiRoomInfo
from channels.db import database_sync_to_async
import random
import json
import threading, asyncio
import time

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
        await self.initialize_game() # fixed
        await self.channel_layer.group_add(game_id, self.channel_name)

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
                'y': 100,
            },
            self.game_data.paddle2: {
                'x': 0,
                'y': 300,
            },
            self.game_data.paddle3: {
                'x': 790,
                'y': 100,
            },
            self.game_data.paddle4: {
                'x': 790,
                'y': 300,
            },
        }
        if self.game_start == False:
            self.game_score = {
                'left': 0,
                'right': 0,
            },

    @database_sync_to_async
    def init_game_paddle(self):
        # print('before init_game_paddle:\n',
        #     self.game_data.paddle1, '\n',
        #     self.game_data.paddle2, '\n',
        #     self.game_data.paddle3, '\n',
        #     self.game_data.paddle4, '\n')
        if not self.game_data.paddle1:
            # print('inside paddle 1 statement')
            self.game_data.paddle1 = self.client_id
        elif not self.game_data.paddle2:
            # print('inside paddle 2 statement')
            self.game_data.paddle2 = self.client_id
        elif not self.game_data.paddle3:
            # print('inside paddle 3 statement')
            self.game_data.paddle3 = self.client_id
        elif not self.game_data.paddle4:
            # print('inside paddle 4 statement')
            self.game_data.paddle4 = self.client_id
            # print('after init_game_paddle:\n',
            # self.game_data.paddle1, '\n',
            # self.game_data.paddle2, '\n',
            # self.game_data.paddle3, '\n',
            # self.game_data.paddle4, '\n')
        self.game_data.save()

    async def initialize_game(self):
        await self.init_game_paddle()
        await self.init_game_value()
        await self.init_game_state()

    
    async def init_thread_ball(self):
        print('init_thread_ball function called')
        # self.thread = threading.Thread(target=self.ball_move_thread, args=[])
        self.thread = threading.Thread(target=asyncio.run, args=(self.ball_move_thread(),))
        self.thread.setDaemon(True)

    async def init_game_state(self):
        if self.game_data.paddle1 and self.game_data.paddle2 and self.game_data.paddle3 and self.game_data.paddle4:
            # print('init_game_state: inside if')
            await self.init_thread_ball()
            # await self.send((await self.make_json_response('game_status', 'wait', self.game_state + self.game_score)))

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

    # @database_sync_to_async
    async def check_user_all_ready(self):
        if not (self.game_data.client1 and self.game_data.client2 and self.game_data.client3 and self.game_data.client4):
            return
        if (self.game_data.client1['ready_status'] == 'ready' and self.game_data.client2['ready_status'] == 'ready' and 
            self.game_data.client3['ready_status'] == 'ready' and self.game_data.client4['ready_status'] == 'ready'):
            # self.send(self.make_json_response('game_status', 'start', {}))
            await self.channel_layer.group_send(self.game_id,
                                                    {
                                                        'type': 'game_status',
                                                        'action': 'start',
                                                        'data': {},
                                                        'sender_channel_name': self.channel_name,
                                                    })
            # time.sleep(3)
            print('self.thread: ', self.thread)
            if (self.thread):
                self.game_start = True
                self.thread.start()

    async def send_game_state(self):
        await self.channel_layer.group_send(self.game_id, await self.make_dict_response('info', 'ball', self.game_state))

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
                                                        'type': 'room_inform', # pre-defined
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
                                                        'type': 'room_inform', # pre-defined
                                                        'action': 'unready',
                                                        'n_client': n_client,
                                                        'quantity_player_ready': self.game_data.QuantityPlayerReady,
                                                        'sender_channel_name': self.channel_name,
                                                    })
            elif type == 'player_info':
                n_client = data['n_client']
                await self.channel_layer.group_send(self.game_id,
                                                    {
                                                        'type': 'room_inform', # pre-defined
                                                        'action': 'join',
                                                        'n_client': n_client,
                                                        'quantity_player_ready': self.game_data.QuantityPlayerReady,
                                                        'sender_channel_name': self.channel_name,
                                                    })
            else:
                await self.send(await self.make_json_response('info', 'error', {'error': 'Type is undefined!'}))
        elif action == 'move_paddle' and self.game_start == True:
                direction = text_data_json.get('direction')
                await self.move_paddle(direction)
                # self.send_game_state(self)
                await self.channel_layer.group_send(self.game_id,
                                                        {
                                                            'type': 'game_status',
                                                            'action': 'move_paddle',
                                                            'data': self.game_state,
                                                            'sender_channel_name': self.channel_name,
                                                        })
        else:
            await self.send(await self.make_json_response('info', 'error', {'error': 'There is nothings to do!'}))

    # broadcasting for game event: ex. start/end
    async def game_status(self, event):
        action = event['action']
        data = event['data']
        print('game_status !!!!!!!!!!!!!!!!!')

        if action == 'start':
            await self.send(text_data=json.dumps({
                    'info': 'game',
                    'type': 'start',
                    'data': {},
                }))
        if action == 'ball':
            await self.send(text_data=json.dumps({
                    'info': 'game',
                    'type': 'ball',
                    'data': data,
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
                    'type': 'join', # new
                    'data': {
                        'n_client': n_client,
                        'quantity_player_ready': quantity_player_ready,
                    },
                }))
        if action == 'ready':
            await self.send(text_data=json.dumps({
                'info': 'player',
                'type': 'ready', # new
                'data': {
                    'n_client': n_client,
                    'quantity_player_ready': quantity_player_ready,
                },
            }))
        elif action == 'unready':
            await self.send(text_data=json.dumps({
                'info': 'player',
                'type': 'unready', # new
                'data': {
                    'n_client': n_client,
                    'quantity_player_ready': quantity_player_ready,
                },
            }))

    async def move_paddle(self, direction):
        if direction == 'down':
                self.game_state[self.client_id]['y'] += 20
        elif direction == 'up':
                self.game_state[self.client_id]['y'] -= 20
        else:
            await self.send(await self.make_json_response('info', 'error', {'error': 'Can not understand paddle direction !'}))

    async def ball_move_thread(self):
        # print('ball_move_thread function called, self: ', self)
        while True:
            # print('data: ', self.game_state)
            self.paddle_ball_collision()
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
            # self.channel_layer.group_send(self.game_id, {self.make_dict_response('info', 'ball', self.game_state)})
            await self.channel_layer.group_send(self.game_id,
                                                        {
                                                            'type': 'game_status',
                                                            'action': 'ball',
                                                            'data': self.game_state,
                                                            'sender_channel_name': self.channel_name,
                                                        })
            # time.sleep(1)
            time.sleep(0.1)

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
