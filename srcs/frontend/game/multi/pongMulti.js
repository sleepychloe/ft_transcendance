
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

const sendPaddleMovement = async (e) => {
	let direction = undefined;

	if (e.key === 'ArrowUp') {
		direction = "up";
	} else if (e.key === 'ArrowDown') {
		direction = "down";
	} else {
		console.log('no such action: ', e.key);
		return;
	}
	await ws.send(JSON.stringify({
		'action': 'move_paddle',
		'direction': direction,
	}));
	console.log("Paddle movement sent:", direction);
}

function reqWsConnection(url="") {
	return new Promise((resolve, reject) => {
		ws = new WebSocket(url);
		ws.onopen = () => {
			console.log('websocket connection is open: calling resolve');
			resolve(ws);
		};
		ws.onmessage = (event) => {
			const response = JSON.parse(event.data);
			const data = response.data;

			if (response.info === 'player') {
				if (response.type === 'join') {
					console.log('new player joined lobby: ', data.n_client);
					lobbyPlayerComponent(data.n_client);
				} else if (response.type === 'ready') {
					console.log('player is ready to play: ', data.n_client);
					updateLobbySlot(data.quantity_player_ready);
					document.getElementsByClassName('btn-game-start')[0].style.display = 'none';
					document.getElementsByClassName('ready')[0].style.display = 'block';
				} else if (response.type === 'unready') {
					console.log('player is NOT ready to play: ', data.n_client);
					updateLobbySlot(data.quantity_player_ready);
					document.getElementsByClassName('btn-game-start')[0].style.display = 'block';
					document.getElementsByClassName('ready')[0].style.display = 'none';
				} else {
					console.log('wrong player info type has been recieved: ', response.type);
				}
			} else if (response.info === 'game') {
				if (response.type === 'position') {
					canvas = document.getElementById("pongCanvas");
					ctx = canvas.getContext("2d");
					ctx.fillStyle = 'white';
					ctx.clearRect(0, 0, 800, 400);
					Object.entries(data).forEach(([key, value]) => {
						if (key === 'ball') {
							ctx.beginPath();
							ctx.arc(value.x, value.y, 10, 0, Math.PI * 2, false);
							ctx.fill();
						} else {
							ctx.fillRect(value.x, value.y, 10, 50);
						}
					});
				} else if (response.type === 'start') {
					console.log('start the game');
					document.getElementsByClassName('main-part')[0].innerHTML = '';
					document.getElementsByClassName('main-part')[0].appendChild(multiGameScreenComponent());
					document.addEventListener('keydown', sendPaddleMovement);
				} else if (response.type === 'finish') {
					console.log('finish the game');
					document.removeEventListener('keydown', sendPaddleMovement);
				} else {
					console.log('wrong game info type has been recieved: ', response.type);
				}
			}
		};
		ws.onclose = (event) => {
			console.log('websocket closed');
			// playerLobbyDisconnect(); // from lobbyPlayersList
			// setTimeout(reqWsConnection(url), 1000);
		}
		ws.onerror = (error) => {
			console.log('websocket connection has error: calling reject');
			reject(error);
		};
	});
}

async function multiConnectWs(url="", data={}) {
	try {
		let player_info = {
			'action': 'update',
			'type': 'player_info',
			'data': {
				'client_id': data.client_id,
				'n_client': data.n_client,
			},
		};
		n_client = data.n_client[6] - 1;
		ws = await reqWsConnection(url + data.room_id + '/');
		ws.send(JSON.stringify(player_info));
		return ws;
	} catch (error) {
		console.log('error on establishing websocket connection: ', error);
	}
}

async function multiPlayerSetReady(ws={}, data={}) {
	// console.log('player send ready to server: ', data);
	document.getElementsByClassName('btn-game-start')[0].style['pointer-events'] = 'none';
	await ws.send(JSON.stringify(data));
	document.getElementsByClassName('ready')[0].style['pointer-events'] = 'visible';
}

async function multiPlayerUnsetReady(ws={}, data={}) {
	// console.log('player send unready to server: ', data);
	document.getElementsByClassName('ready')[0].style['pointer-events'] = 'none';
	await ws.send(JSON.stringify(data));
	document.getElementsByClassName('btn-game-start')[0].style['pointer-events'] = 'visible';
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
		console.error('error while joining room: ', error);
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
		console.error('error while getting room list (GET): ', error);
		return {'Error': 'couldn\'t get lobby data from the server'};
	}
}

function multiListRoom() {
	console.log('sending request to list room...');
	document.getElementsByClassName('main-part')[0].innerHTML = `<div class="loading"></div>`;
	document.getElementsByClassName('loading')[0].style.visibility = 'visible';
	getListRoom(apiListroom).then((data) => {
		let mainPart = document.getElementsByClassName('main-part')[0];

		if (data.length === 0) {
			console.groupCollapsed('server responded successfully');
				console.log('data: ', data);
			console.groupEnd();
			
			mainPart.innerHTML = '';
			mainPart.appendChild(responseMsgComponent(data.Error));
		} else if (data && data.length > 0) {
			console.groupCollapsed('server responded successfully');
				console.log('data: ', data);
			console.groupEnd();

			mainPart.innerHTML = '';
			mainPart.appendChild(lobbyListRoomComponent(data));
		} else {
			console.groupCollapsed('server responded with error');
				console.log('data: ', data);
			console.groupEnd();

			mainPart.innerHTML = '';
			mainPart.appendChild(responseMsgComponent(data.Error));
		}
	});
};
