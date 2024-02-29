const tr = {
	en: {
		ready: "are ready",
		errorFailToLoad: "failed to load data from server",
	},
	fr: {
		ready: "sont prêts",
		errorFailToLoad: "échec du chargement des données depuis le serveur",
	},
	ko: {
		ready: "준비됨",
		errorFailToLoad: "서버에서 데이터를 로드하는 데 실패했습니다",
	},
};

const lan = tr[currentLanguage];


// global variables
let ws;

// websocket base URL
const wsBaseURL = "wss://" + window.location.host + "/ws/";

// api endpoint URLs
const apiBaseURL = "/api/game/";
const apiMakeroom = apiBaseURL + "makeroom/";
const apiListroom = apiBaseURL + "listroom/";
const apiJoinroom = apiBaseURL + "";

// CSRF
function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

const createRoomOnEnter = async (e) => {
	if (e.key === 'Enter') {
		multiCreateRoom();
	}
}

function modalShow() {
	let overlay = document.getElementsByClassName('overlay')[0];
	let modal = document.getElementsByClassName('modal')[0];
	let roomNameInput = document.getElementById('room-name-input');
	if (overlay && modal && roomNameInput) {
		roomNameInput.addEventListener('keydown', createRoomOnEnter);
		overlay.addEventListener('click', modalClose);
		modal.style.visibility = 'visible';
		overlay.style.visibility = 'visible';
		roomNameInput.select();
	}
}

function modalClose() {
	let modal = document.getElementsByClassName('modal')[0];
	let overlay = document.getElementsByClassName('overlay')[0];
	let roomNameInput = document.getElementById('room-name-input');
	if (modal && overlay && roomNameInput) {
		roomNameInput.removeEventListener('keydown', createRoomOnEnter);
		overlay.removeEventListener('click', modalClose);
		modal.style.visibility = 'hidden';
		overlay.style.visibility = 'hidden';
	}
}

async function multiPlayerSetReady(ws = {}, data = {}) {
	// console.log('player send ready to server: ', data);
	document.getElementsByClassName('btn-game-start')[0].style['pointer-events'] = 'none';
	await ws.send(JSON.stringify(data));
	document.getElementsByClassName('btn-game-start')[0].style.display = 'none';
	document.getElementsByClassName('ready')[0].style.display = 'block';
}

async function multiPlayerUnsetReady(ws = {}, data = {}) {
	// console.log('player send unready to server: ', data);
	document.getElementsByClassName('ready')[0].style['pointer-events'] = 'none';
	await ws.send(JSON.stringify(data));
	document.getElementsByClassName('btn-game-start')[0].style.display = 'block';
	document.getElementsByClassName('ready')[0].style.display = 'none';
}

function updateLobbyPlayerList(data = {}) {
	let lobbyPlayerList = document.getElementsByClassName('lobby-players-list')[0];
	lobbyPlayerList.replaceWith(lobbyListPlayersComponent(data.quantity_player));
}

function updateReadyButton(ready = false) {
	let btnUndo = document.getElementsByClassName('ready')[0];
	let btnReady = document.getElementsByClassName('btn-game-start')[0];
	if (ready) {
		btnUndo.style['pointer-events'] = 'visible';
	} else {
		btnReady.style['pointer-events'] = 'visible';
	}
}

function updateLobbySlot(quantity_player_ready = 0) {
	let lobbySlot = document.getElementsByClassName('lobby-space-counter')[0];
	if (lobbySlot)
		lobbySlot.innerHTML = quantity_player_ready + '/4 ' + `${lan.ready}`;
}

const sendPaddleMovement = async (e) => {
	if (e.key === 'ArrowUp') {
		await ws.send(JSON.stringify({
			'action': 'move_paddle',
			'direction': "up",
		}));
	} else if (e.key === 'ArrowDown') {
		await ws.send(JSON.stringify({
			'action': 'move_paddle',
			'direction': "down",
		}));
	} else {
		console.warn('no such action: ', e.key);
		return;
	}
	// console.log("Paddle movement sent:", direction);
}

function multiStartGame() {
	let mainPart = document.getElementsByClassName('main-part')[0];
	let lobby = document.getElementsByClassName('lobby')[0];
	let game = document.getElementsByClassName('game')[0];
	lobby.style.display = 'none';
	if (game) {
		game.style.display = 'flex';
	} else {
		mainPart.appendChild(multiGameScreenComponent());
	}
	document.addEventListener('keydown', sendPaddleMovement);
}

function multiFinishGame() {
	let lobby = document.getElementsByClassName('lobby')[0];
	let game = document.getElementsByClassName('game')[0];
	lobby.style.display = 'flex';
	game.style.display = 'none';
	document.removeEventListener('keydown', sendPaddleMovement);
}

function reqWsConnection(url = "") {
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
					console.log('player joined lobby: ', data.n_client);
					updateLobbyPlayerList(data);
				} else if (response.type === 'disconnect') {
					console.log('player left lobby: ', data.n_client);
					updateLobbySlot(data.quantity_player_ready);
					updateLobbyPlayerList(data);
				} else if (response.type === 'reconnect') {
					console.log('player reconnected: ', data.n_client);
					updateLobbySlot(data.quantity_player_ready);
					updateLobbyPlayerList(data);
				} else if (response.type === 'ready') {
					console.log('player is ready to play: ', data.n_client);
					updateReadyButton(true);
					updateLobbySlot(data.quantity_player_ready);
				} else if (response.type === 'unready') {
					console.log('player is NOT ready to play: ', data.n_client);
					updateReadyButton(false);
					updateLobbySlot(data.quantity_player_ready);
				} else {
					console.warn('wrong player info type has been recieved: ', response.type);
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
					multiStartGame();
				} else if (response.type === 'finish') {
					console.log('finish the game');
					multiPlayerUnsetReady(ws, data);
					updateReadyButton(false);
					updateLobbySlot(data.quantity_player_ready);
					multiFinishGame();
				} else {
					console.warn('wrong game info type has been recieved: ', response.type);
				}
			}
		};
		ws.onclose = (event) => {
			console.log('websocket closed: ', event);
			multiFinishGame();
		}
		ws.onerror = (error) => {
			console.error('websocket connection has error: calling reject');
			reject(error);
		};
	});
}

async function multiConnectWs(url = "", data = {}) {
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
		ws.send(JSON.stringify(player_info));
		return ws;
	} catch (error) {
		console.error('error on establishing websocket connection: ', error);
	}
}

async function reqCreateRoom(url = "", data = {}) {
	try {
		const response = await fetch(url, {
			method: "POST",
			mode: "cors",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCookie('csrftoken'),
			},
			body: JSON.stringify(data),
		});
		const result = await response.json();
		return result;
	} catch (error) {
		console.error('couldn\'t request to server to create a room: ', error);
		return { 'Error': `${errorFailToLoad}` };
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
	let mainPart = document.getElementsByClassName('main-part')[0];
	mainPart.innerHTML = '';
	mainPart.appendChild(loadingCircleComponent());
	reqCreateRoom(apiMakeroom, { "room_name": roomName }).then(async (data) => {
		mainPart.innerHTML = '';
		if (data && !data.Error) {
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();

			ws = await multiConnectWs(wsBaseURL, data);

			let mainTitle = document.getElementsByClassName('main-title')[0];
			mainTitle.innerHTML = data.room_name;

			if (data.status === 'create') {
				mainPart.appendChild(lobbyComponent(ws, data));
			}
		} else {
			console.groupCollapsed('server responded with error');
			console.error('data: ', data);
			console.groupEnd();
			mainPart.appendChild(responseMsgComponent(data.Error));
		}
	});
};

async function reqJoinRoom(url = "", room_id = "") {
	try {
		const response = await fetch(url + room_id + '/', {
			method: "PUT",
			mode: "cors",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCookie('csrftoken'),
			},
		});
		const result = await response.json();
		return result;
	} catch (error) {
		console.error('couldn\'t request to server to join a room: ', error);
		return { 'Error': `${lan.errorFailToLoad}` };
	}
}

function multiJoinRoom() {
	console.log('sending request to join room...');
	let mainPart = document.getElementsByClassName('main-part')[0];
	const room_id = this.getElementsByClassName('lobby-room-card-name')[0].id;
	mainPart.innerHTML = '';
	mainPart.appendChild(loadingCircleComponent());
	reqJoinRoom(apiJoinroom, room_id).then(async (data) => {
		mainPart.innerHTML = '';
		if (data && !data.Error) {
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();

			ws = await multiConnectWs(wsBaseURL, data);

			let mainTitle = document.getElementsByClassName('main-title')[0];
			mainTitle.innerHTML = data.room_name;
			if (data.status === 'join') {
				mainPart.appendChild(lobbyComponent(ws, data));
			} else if (data.status === 'reconnect') {
				mainPart.appendChild(lobbyComponent(ws, data));
				multiStartGame();
			}
		} else {
			console.groupCollapsed('server responded with error');
			console.error('data: ', data);
			console.groupEnd();
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
		console.error('couldn\'t request to server to get list room: ', error);
		return { 'Error': `${lan.errorFailToLoad}` };
	}
}

function multiListRoom() {
	console.log('sending request to list room...');
	let mainPart = document.getElementsByClassName('main-part')[0];
	mainPart.innerHTML = '';
	mainPart.appendChild(loadingCircleComponent());
	getListRoom(apiListroom).then((data) => {
		mainPart.innerHTML = '';
		if (data.length === 0) {
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();
			mainPart.appendChild(responseMsgComponent('no lobby found'));
			mainPart.appendChild(lobbyRefreshButtonComponent());
		} else if (data && data.length > 0) {
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();
			mainPart.appendChild(lobbyListRoomComponent(data));
			mainPart.appendChild(lobbyRefreshButtonComponent());
		} else {
			console.groupCollapsed('server responded with error');
			console.error('data: ', data);
			console.groupEnd();
			mainPart.appendChild(responseMsgComponent(data.Error));
		}
	});
};

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
