from channels.generic.websocket import WebsocketConsumer
import random
import json

class defaultConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.initialize_game()

    def disconnect(self, close_code):
        pass

    def initialize_game(self):
        # Initialize or reset game state
        self.game_state = {
            'ball': {
                'x': 400,  # Center for an 800x600 canvas
                'y': 300,  # Center for an 800x600 canvas
                'vx': 2 + 1.5 * random.random(),  # Velocity in X direction with randomness
                'vy': 2 + 1.5 * random.random(),  # Velocity in Y direction with randomness
            },
            'paddle': {
                'x': 0,  # Initial Y position (closer to the bottom of a 600px high canvas)
                'y': 300,
            },
            # Add more game state attributes as needed
        }
        self.send_game_state()

    def send_game_state(self):
        self.send(text_data=json.dumps({'type': 'game_state', 'data': self.game_state}))

    def update_game_state(self):
        # Update the ball's position based on its velocity
        self.game_state['ball']['x'] += self.game_state['ball']['vx']
        self.game_state['ball']['y'] += self.game_state['ball']['vy']

        # Boundary collision detection for an 800x600 canvas
        if self.game_state['ball']['x'] <= 0 or self.game_state['ball']['x'] >= 800:
            self.game_state['ball']['vx'] = -self.game_state['ball']['vx']
        if self.game_state['ball']['y'] <= 0 or self.game_state['ball']['y'] >= 600:
            self.game_state['ball']['vy'] = -self.game_state['ball']['vy']

    def receive(self, text_data=None, bytes_data=None):
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

    def move_paddle(self, direction):
        if direction == 'left':
            self.game_state['paddle']['x'] -= 10
        elif direction == 'right':
            self.game_state['paddle']['x'] += 10
        elif direction == 'down':
            self.game_state['paddle']['y'] += 10
        elif direction == 'up':
            self.game_state['paddle']['y'] -= 10
        

    #     # Add boundary checks to prevent the paddle from moving out of the canvas
    #     paddle = self.game_state['paddle']
    #     if paddle['y'] - paddle['height'] < 0:
    #         paddle['y'] = 0
    #     elif paddle['y'] + paddle['height'] > 600:  # Assuming canvas width is 800px
    #         paddle['y'] = 600 - paddle['height']

    # Placeholder for future movement handling
    def handle_movement(self, type, direction):
        print(f"Handling movement. Type: {type}, Direction: {direction}")
        # Placeholder for movement logic
