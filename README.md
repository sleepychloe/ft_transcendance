## ft_transcendence version 14.1 in ecole42 PARIS
- [ychun](https://profile.intra.42.fr/users/ychun) (Yugeon CHUN)
- [yhwang](https://profile.intra.42.fr/users/yhwang) (Chloe HWANG)
- [schaehun](https://profile.intra.42.fr/users/schaehun) (Chaehun SONG)

Mandatory part + Bonus part

Tested on Linux

Success 125/100

DON'T FORGET TO REMOVE .env FILE BEFORE SUBMITTING !


## Installation

```bash
  git clone https://github.com/sleepychloe/ft_transcendance.git
  cd ft_transcendance
  make
  (url) https://localhost:4243
```


## Modules

```
  • Web
      Major: Use a Framework as backend (1)
      Minor: Use a front-end framework or toolkit (0.5)
      Minor: Use a database for the backend (0.5)
  • User Management
      Major: Implementing a remote authentication (1)
  • Gameplay and UX
      Major: Remote Players (1)
      Major: Multiplayers (1)
  • Devops
      Major: Infrastructure Setup for Log Management (1)
  • Graphics
      Major: Use of advanced 3D techniques (1)
  • Accessibility
      Minor: Support on all devices (0.5)
      Minor: Expanding Browser Compatibility (0.5)
      Minor: Multiple Language Supports (0.5)
  • Server-Side Pong
      Major: Replacing Basic Pong with Server-Side Pong and Implementing an API (1)

  Total 9.5 Modules (7 Modules for mandatory, 2.5 Modules for bonus)
```


## Transcendance page

### Home
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/ft_transcendance/home.gif)


### Local
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/ft_transcendance/local.gif)


### Local 3D
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/ft_transcendance/local_3d.gif)


### Tournament
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/ft_transcendance/tournament.gif)


### Multi
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/9deaede6-0982-4e68-974a-0472c5b47e14)
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/b70c79a9-da2c-4d6a-adf9-d7bb7a6d7d3e)
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/ft_transcendance/multi_3.gif)



## Modules

### Web: Use a Framework as backend
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/063fd48d-29b5-40df-ab85-0b90cc92259e)


### Web: Use a front-end framework or toolkit
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/4788cf0a-1290-470e-84b0-5d452ddeff85)


### Web: Use a database for the backend
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/9b735623-72c3-4caf-848f-b75a1fca14c8)


#### List of Docker Containers
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/5c656fa5-13b0-430e-abf6-3fb2d67f3720)


### User Management: Implementing a remote authentication
##### we disabled this module after submitting out project, so everyone can access our ft_transcendance
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/25391541-1343-4db5-a4dc-918a6494dbcd)
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/d38f0648-4cd4-48f6-a0af-38ad9bd1ff80)


### Gameplay and UX: Remote Players & Multiplayers
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/gameplay/remote%26multi.gif)


### Devops: Infrastructure Setup for Log Management
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/752ce14c-da3e-41ca-b427-0de45fd0bd17)
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/fde70b3d-ddbe-479e-9241-b0c3c0e2a6b8)
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/9eb06fcb-f7bc-4da1-8f7b-b0294686da6d)


### Graphics: Use of advanced 3D techniques
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/graphics/advanced_3D_techniques_1.gif)
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/graphics/advanced_3D_techniques_2.gif)


### Accessibility: Support on all devices
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/564323ce-65ef-42ee-8ab9-98d382782c5d)
![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/2152d9e3-9344-486f-a0ff-1d7da0ca0ac7)


### Accessibility: Expanding Browser Compatibility
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/accessibility/expanding_browser_compatibility_1.gif)
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/accessibility/expanding_browser_compatibility_2.gif)


### Accessibility: Multiple Language Supports
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/accessibility/multiple_language_1.gif)
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/accessibility/multiple_language_2.gif)
![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/accessibility/multiple_language_3.gif)


### Server-Side Pong: Replacing Basic Pong with Server-Side Pong and Implementing an API

#### How to run

1. go to the directory "clitest"

```
  cd ft_transcendance
  cd clitest
```

2. check list of room for multi game

```
  python3 apirequest.py [path] [method] [body]
```

3. join an existing room

```
  python3 joinroom.py [room_id]
```

4. connect websocket, so client can get ready

```
  python3 wsgame.py [room_id] [client_id] [n_client]
```

5. move the paddle after starting the game
6. 
```
  python3 gamemove.py [room_id] [client_id]
```


#### api-test

![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/b19ba121-36db-448d-9267-f2bdba63a848)
###### ↳ when there is no existing room
```
  python3 apirequest.py listroom/ GET ""
```

![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/c147eaf2-7ef6-44a6-9524-a8a051e0faeb)
###### ↳ when there is at least one room (room_id: 1a6d9c10202a4569973f6728c5781ce3)
```
  python3 apirequest.py listroom/ GET ""
```

![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/8a1e1299-5848-4258-9ff0-413a7cbdbdd9)
###### ↳ join to the room that room_id is 1a6d9c10202a4569973f6728c5781ce3<br>&nbsp;&nbsp;&nbsp;&nbsp (client_id: 7b1bc09220044793ba11a3b76f19a5e6, n_client: client4)
```
  python joinroom.py "1a6d9c10202a4569973f6728c5781ce3"
```

![image](https://github.com/sleepychloe/ft_transcendance/assets/78352910/a5bf998d-df57-4ff7-9a55-a790c2c1d7b9)
###### ↳ connect websocket for player in the room (room_id: 1a6d9c10202a4569973f6728c5781ce3)<br>&nbsp;&nbsp;&nbsp;&nbsp for player whose client_id is 7b1bc09220044793ba11a3b76f19a5e6, and  n_client is client4
```
  python3 wsgame.py "1a6d9c10202a4569973f6728c5781ce3" "7b1bc09220044793ba11a3b76f19a5e6" "client4"
```

![Animated GIF](https://github.com/sleepychloe/ft_transcendance/blob/main/img/modules/server-side_pong/server-side_5.gif)
###### ↳ move paddle after starting game, using key w(paddle up) and key s(paddle down)
```
  python3 wsgame.py "1a6d9c10202a4569973f6728c5781ce3" "7b1bc09220044793ba11a3b76f19a5e6"
```

