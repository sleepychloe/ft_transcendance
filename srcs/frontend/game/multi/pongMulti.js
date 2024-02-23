// let roomName = "12345";

// let chatSocket = new WebSocket(
// 	`wss://${window.location.host}/ws/`
// );

// chatSocket.onmessage = (e) => {
// 	let data = JSON.parse(e.data);
// 	let message = data['message'];
// 	document.querySelector("#chat-log").value += (message + '\n');
// };

// chatSocket.onclose = (e) => {
// 	console.error('Chat socket closed unexpectedly');
// };

// document.querySelector("#chat-message-input").focus();
// document.querySelector("#chat-message-input").addEventListener("keyup", (e) => {
// 	if (e.keyCode === 13) {
// 		document.querySelector("#chat-message-submit").click();
// 	}
// });

// document.querySelector("#chat-message-submit").addEventListener("click", (e) => {
// 	let messageInputDom = document.querySelector("#chat-message-input");
// 	let message = messageInputDom.value;
// 	chatSocket.send(JSON.stringify({
// 		'message': message
// 	}));

// 	messageInputDom.value = '';
// });


// function sendMessage() {
// 	const message = { message: 'Hello from the client!' };
// 	if (gameSocket.readyState === WebSocket.OPEN) {
// 	    gameSocket.send(JSON.stringify(message));
// 	}
// 	console.log(`sent`);
//     }

//     // Example usage: Call sendMessage() based on some event, like a button click.
// document.addEventListener("keydown", (e) => {
//     if (e.key === "ArrowLeft" || e.key === "a") {
//        sendMessage();
//     }
//     // Consider adding "ArrowUp" or "ArrowDown" if your game logic requires it
// });

// gameSocket.onmessage = function(event) {
// 	console.log("Received message from server: ", event.data);
// 	let data = JSON.parse(event.data);
// 	console.log("Received data from server: ", data.message);  // Ensure this logs the echoed message.
//     };

let gameSocket;
//  = new WebSocket(
// 		`wss://${window.location.host}/ws/`
// 	);; // Declare gameSocket at the top for global access

// connectWebSocket();

function connectWebSocket() {
	// Ensure WebSocket uses the correct protocol (wss for secure, ws for local development)
	const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
	gameSocket = new WebSocket(`${protocol}${window.location.host}/ws/`);

	gameSocket.onopen = function (event) {
		console.log("WebSocket is open now.");
	};

	gameSocket.onmessage = function (event) {
		try {
			let data = JSON.parse(event.data);
			//     console.log("Parsed data:", data);
			updateGameState(data);
		} catch (error) {
			console.error("Error parsing JSON:", error);
		}
	};

	gameSocket.onerror = function (error) {
		console.error("WebSocket Error:", error);
	};

	gameSocket.onclose = function (event) {
		console.error("WebSocket is closed now. Code:", event.code, "Reason:", event.reason);
		// Attempt to reconnect after a delay
		setTimeout(connectWebSocket, 5000);
	};
}

// Initialize WebSocket connection
document.addEventListener('DOMContentLoaded', function () {
	if (document.getElementById('pongCanvas')) {
		console.log("Canvas is initialized.");
	} else {
		console.log("Canvas is not found.");
	}
	connectWebSocket();
});

let paddleX = 0, paddleY = 300;

function updateGameState(data) {
	// if (data.ball) {
	// 	const canvas = document.getElementById('pongCanvas');
	// 	const ctx = canvas.getContext('2d');
	// 	const ball = data.data;

	// 	// Clear the canvas
	// 	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// 	ctx.fillStyle = 'white';
	// 	ctx.beginPath();
	// 	ctx.arc(data['ball']['x'], data['ball']['y'], ballSize, 0, Math.PI * 2, false);
	// 	// ctx.arc(data.type.ball['x'], data.type.ball['x'], ballSize, 0, Math.PI * 2, false);
	// 	ctx.fill();
	// }
	if (data.type === 'game_state') {
		const canvas = document.getElementById('pongCanvas');
		const ctx = canvas.getContext('2d');
		const ball = data.data.ball; // Correctly access the ball data
		const ballSize = 10; // Define ballSize if not already defined

		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw the ball
		ctx.fillStyle = 'white';
		ctx.beginPath();
		if (data.data.ball)
			ctx.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2, false);
		if (data.data.paddle) {
			paddleX = data.data.paddle.x;
			paddleY = data.data.paddle.y;
		}
		ctx.fillRect(paddleX, paddleY, 10, 100);
		ctx.fill();
	}
}

function sendPaddleMovement(direction) {
	if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
		gameSocket.send(JSON.stringify({
			'action': 'move_paddle',
			'type': 'move',
			'direction': direction
		}));
		console.log("Paddle movement sent:", direction);
	} else {
		console.error("WebSocket is not open. Unable to send message.");
	}
}

// document.addEventListener("keydown", (e) => {
// 	if (e.key === "ArrowLeft") {
// 		sendPaddleMovement("left");
// 	} else if (e.key === "ArrowRight") {
// 		sendPaddleMovement("right");
// 	} else if (e.key === "ArrowDown") {
// 		sendPaddleMovement("down");
// 	} else if (e.key === "ArrowUp") {
// 		sendPaddleMovement("up");
// 	}
// });

// function triggerUpdate() {
// 	if (gameSocket.readyState === WebSocket.OPEN) {
// 		gameSocket.send(JSON.stringify({ action: 'update' })); // Trigger an update
// 	}
// }

// setInterval(triggerUpdate, 1000 / 60); // Trigger updates at ~60fps

// function getCookie(name) {
//     var cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         var cookies = document.cookie.split(';');
//         for (var i = 0; i < cookies.length; i++) {
//             var cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

//////////////////////// for debugging ////////////////////////
function deleteAllCookies() {
	const cookies = document.cookie.split(";");

	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i];
		const eqPos = cookie.indexOf("=");
		const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
	}
}
///////////////////////////////////////////////////////////////

// websocket base URL
const wsBaseURL = "wss://localhost:4243/ws/";
// api endpoint URLs
const apiBaseURL = "/api/game/";
const apiMakeroom = apiBaseURL + "makeroom/";
const apiListroom = apiBaseURL + "listroom/";
const apiJoinroom = apiBaseURL + "";

let ws;

function modalShow() {
	document.getElementsByClassName('overlay')[0].addEventListener('click', modalClose);
	document.getElementsByClassName('modal')[0].style.visibility = 'visible';
	document.getElementsByClassName('overlay')[0].style.visibility = 'visible';
	document.getElementById('room-name-input').select();
}

function modalClose() {
	document.getElementsByClassName('modal')[0].style.visibility = 'hidden';
	document.getElementsByClassName('overlay')[0].style.visibility = 'hidden';
}

function updateLobbySlot(quantity_player_ready) {
	document.getElementsByClassName('lobby-space-counter')[0].innerHTML = quantity_player_ready + '/4 are ready';
}

function reqWsConnection(url="") {
	return new Promise((resolve, reject) => {
		ws = new WebSocket(url);
		ws.onopen = () => {
			console.log('websocket connection is open: calling resolve');
			resolve(ws);
		};
		ws.onmessage = (event) => {
			let response = JSON.parse(event.data);
			let data = response.data;

			// websocket channel broadcasting
			console.log('new broadcast arrived: ', response);

			if (response.info === 'player') {
				if (response.type === 'join') {
					console.log('new player joined lobby: ', data.n_client);
					lobbyPlayerComponent(data.n_client);
				}
				else if (response.type === 'ready') {
					console.log('player is ready to play: ', data.n_client);
					updateLobbySlot(data.quantity_player_ready);
				}
				else if (response.type === 'unready') {
					console.log('player is NOT ready to play: ', data.n_client);
					updateLobbySlot(data.quantity_player_ready);
				}
			} else if (response.info === 'game') {
				if (response.type === 'ball') {
					console.log('recieved ball data: ', data);

					canvas = document.getElementById("pongCanvas");
					ctx = canvas.getContext("2d");
					let ball = data.ball;
					ctx.clearRect(0, 0, 800, 400);
					ctx.fillStyle = 'white';
					ctx.beginPath();
					ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2, false);
					ctx.fill();
					
				} else if (response.type === 'start') {
					console.log('start the game');
					document.getElementsByClassName('main-part')[0].innerHTML = `<canvas id="pongCanvas" width="800" height="600"></canvas>`;
					// game logic
					// enable user to control the game - eventListener(keypress)
					// enable user to leave game at any time
				}
			}
		};
		ws.onclose = (event) => {
			console.log('websocket closed');
			// playerLobbyDisconnect(playerId); // from lobbyPlayersList
			// setTimeout(reqWsConnection(url), 1000);
		}
		ws.onerror = (error) => {
			console.log('websocket connection has error: calling reject');
			reject(error);
		};
	});
}

async function multiConnectWs(url="", data={}) {
	// first connection to the room's ws
	try {
		let player_info = {
			'action': 'update',
			'type': 'player_info',
			'data': {
				'client_id': data.client_id,
				'n_client': data.n_client,
			},
		};
		ws = await reqWsConnection(url + data.room_id + '/');
		// alert to server `whoami`: client_id, n_client
		ws.send(JSON.stringify(player_info));
		return ws;
	} catch (error) {
		console.log('error on establishing websocket connection: ', error);
	}
}

async function multiPlayerSetReady(ws={}, data={}) {
	console.log('player send ready to server: ', data);
	document.getElementsByClassName('btn-game-start')[0].style.display = 'none';
	document.getElementsByClassName('ready')[0].style.display = 'block';
	await ws.send(JSON.stringify(data));
}

async function multiPlayerUnsetReady(ws={}, data={}) {
	console.log('player send unready to server: ', data);
	document.getElementsByClassName('btn-game-start')[0].style.display = 'block';
	document.getElementsByClassName('ready')[0].style.display = 'none';
	await ws.send(JSON.stringify(data));
}

async function reqCreateRoom(url="", data={}) {
	try {
		// console.log('cookie: ', getCookie('csrftoken'));
		const response = await fetch(url, {
			method: "POST",
			mode: 'same-origin',
			headers: {
				"Content-Type": "application/json",
				// "X-CSRFToken": getCookie('csrftoken'),
			},
			body: JSON.stringify(data),
		});
		const result = await response.json();
		return result;
	} catch (error) {
		return {'Error':'POST ' + url + ' Failed'};
	}
}

function multiCreateRoom() {
	let roomName = document.getElementById('room-name-input').value;
	if (!roomName) {
		document.getElementById('room-name-input').style.border = '2px solid red';
		return;
	}
	modalClose();
	console.log('sending request to create room...');
	document.getElementsByClassName('main-part')[0].innerHTML = `<div class="loading"></div>`;
	document.getElementsByClassName('loading')[0].style.visibility = 'visible';
	reqCreateRoom(apiMakeroom, { "room_name": roomName }).then(async (data) => {
		let mainPart = document.getElementsByClassName('main-part')[0];
		if (data && !data.Error) {
			// debugging
			console.groupCollapsed('server responded successfully');
				console.log('data: ', data);
			console.groupEnd();

			ws = await multiConnectWs(wsBaseURL, data);

			mainPart.innerHTML = '';
			document.getElementsByClassName('main-title')[0].innerHTML = data.room_name;
			mainPart.appendChild(lobbyPlayersReadyComponent(data.quantity_player_ready));
			mainPart.appendChild(lobbyListPlayersComponent(data));
			mainPart.appendChild(lobbyReadyButtonComponent(ws, data));
		} else {
			// debugging
			console.groupCollapsed('server responded with error');
				console.log('data: ', data);
			console.groupEnd();
			
			mainPart.innerHTML = multiDefaultPageComponent();
		}
	});
};

async function reqJoinRoom(url="", room_id="") {
	try {
		const response = await fetch(url + room_id + '/', {});
		const result = await response.json();
		return result;
	} catch (error) {
		console.error("error while joining room: ", error);
		return null;
	}
}

function multiJoinRoom() {
	deleteAllCookies();
	console.log('sending request to join room...');
	document.getElementsByClassName('main-part')[0].innerHTML = `<div class="loading"></div>`;
	document.getElementsByClassName('loading')[0].style.visibility = 'visible';
	const room_id = this.getElementsByClassName('lobby-room-card-name')[0].id;
	reqJoinRoom(apiJoinroom, room_id).then(async (data) => {
		let mainPart = document.getElementsByClassName('main-part')[0];
		if (data && !data.Error) {
			// debugging
			console.groupCollapsed('server responded successfully');
				console.log('data: ', data);
			console.groupEnd();

			// server allows to join room === user has a token for ws
			// first websocket connection establish here
			ws = await multiConnectWs(wsBaseURL, data);

			mainPart.innerHTML = '';
			document.getElementsByClassName('main-title')[0].innerHTML = data.room_name;
			mainPart.appendChild(lobbyPlayersReadyComponent(data.quantity_player_ready));
			mainPart.appendChild(lobbyListPlayersComponent(data));
			mainPart.appendChild(lobbyReadyButtonComponent(ws, data));
		} else {
			// debugging
			console.groupCollapsed('server responded with error');
				console.log('data: ', data);
			console.groupEnd();

			mainPart.innerHTML = '';
			mainPart.appendChild(responseMsgComponent(data.Error));
		}
	});
}

async function getListRoom(url = "") {
	try {
		const response = await fetch(url, {
			method: 'GET',
		});
		const result = await response.json();
		return result;
	} catch (error) {
		console.error("error while getting room list (GET): ", error);
		return {"Error":"no lobby found"};
	}
}

function multiListRoom() {
	console.log('sending request to list room...');
	document.getElementsByClassName('main-part')[0].innerHTML = `<div class="loading"></div>`;
	document.getElementsByClassName('loading')[0].style.visibility = 'visible';
	getListRoom(apiListroom).then((data) => {
		let mainPart = document.getElementsByClassName('main-part')[0];

		if (data.length === 0) {
			// debugging
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();
			
			mainPart.innerHTML = '';
			mainPart.appendChild(responseMsgComponent(data.Error));
		} else if (data && data.length > 0) {
			// debugging
			console.groupCollapsed('server responded successfully');
				console.log('data: ', data);
			console.groupEnd();

			mainPart.innerHTML = '';
			mainPart.appendChild(lobbyListRoomComponent(data));
		} else {
			// debugging
			console.groupCollapsed('server responded with error');
				console.log('data: ', data);
			console.groupEnd();

			mainPart.innerHTML = '';
			mainPart.appendChild(responseMsgComponent(data.Error));
		}
	});
};

// document.getElementsByClassName('main-part')[0].innerHTML = multiDefaultPageComponent();
// document.getElementsByClassName('overlay')[0].addEventListener('click', modalClose);
// lobbyRooms[i].addEventListener('click', multiJoinRoom);
