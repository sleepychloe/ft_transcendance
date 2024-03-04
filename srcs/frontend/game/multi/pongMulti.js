import { loadingCircleComponent } from '/static/assets/js/multi/components.js';
import { lobbyRefreshButtonComponent } from '/static/assets/js/multi/components.js';
import { responseMsgComponent } from '/static/assets/js/multi/components.js';
import { lobbyComponent } from '/static/assets/js/multi/components.js';
import { lobbyListPlayersComponent } from '/static/assets/js/multi/components.js';
import { multiGameScreenComponent, multiGameScoreComponent } from '/static/assets/js/multi/components.js';
import { lobbyListRoomComponent } from '/static/assets/js/multi/components.js';

const tr = {
	en: {
		ready: "are ready",
		errorFailToLoad: "failed to load data from server",
		errorNoLobby: "no lobby found",
		score: "Score",
		team1: "Team 1",
	    	team2: "Team 2",
	},
	fr: {
		ready: "sont prêts",
		errorFailToLoad: "échec du chargement des données depuis le serveur",
		errorNoLobby: "aucun lobby trouvé",
		score: "Score",
		team1: "Équipe 1",
            	team2: "Équipe 2",
	},
	ko: {
		ready: "준비됨",
		errorFailToLoad: "서버에서 데이터를 로드하는 데 실패했습니다",
		errorNoLobby: "로비를 찾을 수 없습니다",
		score: "점수",
		team1: "팀 1",
	    	team2: "팀 2",
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

export async function multiPlayerSetReady(ws = {}, data = {}) {
	// console.log('player send ready to server: ', data);
	let btnReady = document.getElementById('btn-multi-ready');
	let btnUnready = document.getElementById('btn-multi-unready');
	btnReady.setAttribute('disabled', true);
	await ws.send(JSON.stringify(data));
	btnReady.className = "justify-content-center btn btn-success w-50 m-auto d-none";
	btnUnready.className = "justify-content-center btn btn-danger w-50 m-auto d-flex";
}

export async function multiPlayerUnsetReady(ws = {}, data = {}) {
	// console.log('player send unready to server: ', data);
	let btnReady = document.getElementById('btn-multi-ready');
	let btnUnready = document.getElementById('btn-multi-unready');
	btnUnready.setAttribute('disabled', true);
	await ws.send(JSON.stringify(data));
	btnReady.className = "justify-content-center btn btn-success w-50 m-auto d-flex";
	btnUnready.className = "justify-content-center btn btn-danger w-50 m-auto d-none";
}

async function updateLobbyPlayerList(data={}) {
	let lobbyPlayerList = document.getElementById('lobby-players-list');
	let roomInfo = await getRoomPlayerInfo(apiBaseURL + data.room_id);
	console.log('updateLobbyPlayerList:roomInfo: ', roomInfo);
	lobbyPlayerList.replaceWith(lobbyListPlayersComponent(data.quantity_player, roomInfo));
}

function updateReadyButton(ready=false) {
	let btnReady = document.getElementById('btn-multi-ready');
	let btnUnready = document.getElementById('btn-multi-unready');
	if (ready) {
		btnUnready.removeAttribute('disabled');
	} else {
		btnReady.removeAttribute('disabled');
	}
}

function updateLobbySlot(quantity_player_ready = 0) {
	let lobbySlot = document.getElementById('lobby-space-counter');
	if (lobbySlot)
		lobbySlot.innerHTML = quantity_player_ready + '/4 ' + `${lan.ready}`;
}

let touchstartY;
let touchendY;

const touchStartPaddle = (e) => {
    // console.log('touchStartPaddle fired');
    touchstartY = e.changedTouches[0].screenY;
}

const touchEndPaddle = async (e) => {
    // console.log('touchEndPaddle fired');
    touchendY = e.changedTouches[0].screenY;
	if (touchendY < touchstartY)
		await ws.send(JSON.stringify({
			'action': 'move_paddle',
			'direction': "up",
		}));
	if (touchendY > touchstartY)
		await ws.send(JSON.stringify({
			'action': 'move_paddle',
			'direction': "down",
		}));
}

const sendPaddleMovement = async (e) => {
	if (e.key === 'w' || e.key === 'i') {
		await ws.send(JSON.stringify({
			'action': 'move_paddle',
			'direction': "up",
		}));
	} else if (e.key === 's' || e.key === 'k') {
		await ws.send(JSON.stringify({
			'action': 'move_paddle',
			'direction': "down",
		}));
	} else {
		// console.warn('no such action: ', e.key);
		return;
	}
	// console.log("Paddle movement sent:", direction);
}

function multiStartGame() {
	let mainPart = document.getElementById('app');
	let lobby = document.getElementById('lobby');
	let game = document.getElementById('game');
	let scoreboard = document.getElementById('scoreboard');
	lobby.className = "d-none flex-column justify-content-center";
	if (game && scoreboard) {
		game.className = "d-flex";
		scoreboard.className = 'd-flex flex-row justify-content-center fs-1 text-white';
	} else {
		let d = document.createElement('div');
		d.className = "d-flex flex-column justify-content-center";
		d.appendChild(multiGameScoreComponent());
		d.appendChild(multiGameScreenComponent());
		mainPart.appendChild(d);
	}
	document.addEventListener('keydown', sendPaddleMovement);
	document.addEventListener('touchstart', touchStartPaddle);
    document.addEventListener('touchend', touchEndPaddle);
}

export function multiFinishGame() {
	let lobby = document.getElementById('lobby');
	let game = document.getElementById('game');
	let scoreboard = document.getElementById('scoreboard');
	if (lobby)
		lobby.className = "d-flex flex-column justify-content-center";
	if (game)
		game.className = "d-none";
	if (scoreboard)
		scoreboard.className = 'd-none flex-row justify-content-center fs-1 text-white';
	document.removeEventListener('keydown', sendPaddleMovement);
	document.removeEventListener('touchstart', touchStartPaddle);
    document.removeEventListener('touchend', touchEndPaddle);
}

export function disconnectGame() {
	if (ws && ws.readyState === WebSocket.OPEN)
		ws.close();
}

function isMobileDevice() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function onWindowResize() {
	let width, height;
	let proportion = 0.5;

	// mobile mode && rotated
	if (isMobileDevice() && window.innerWidth > window.innerHeight) {
		height = window.innerHeight - 4 - 47;
		if (window.innerHeight > 400) {
			height = 400 - 4;
		}
		width = height / proportion;
	} else { // web mode, mobile mode && not rotated
		width = window.innerWidth - 4;

		if (window.innerWidth > 800) {
			width = 800 - 4;
		}
		height = width * proportion;
	}

	let pongCanvas = document.getElementById('pongCanvas');
	if (pongCanvas) {
		pongCanvas.setAttribute('width', width);
		pongCanvas.setAttribute('height', height);
	}
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

			onWindowResize();
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
					console.log('wrong player info type has been recieved: ', response.type);
				}
			} else if (response.info === 'game') {
				if (response.type === 'position') {
					let canvas = document.getElementById("pongCanvas");
					let ctx = canvas.getContext("2d");
					ctx.fillStyle = 'white';
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					Object.entries(data).forEach(([key, value]) => {
						if (key === 'ball') {
							ctx.beginPath();
							ctx.arc(value.x * canvas.width / 800, value.y / 400 * canvas.height, canvas.width / 80, 0, Math.PI * 2, false);
							ctx.fill();
						} else {
							ctx.fillRect(value.x * canvas.width / 800, value.y / 400 * canvas.height, canvas.width / 80, canvas.width / 16);
						}
						let scoreboard = document.getElementById('scoreboard');
						if (scoreboard)
							scoreboard.innerHTML = data.score.left + " : " + data.score.right;
					});
				} else if (response.type === 'start') {
					console.log('start the game');
					multiStartGame();
				} else if (response.type === 'finish') {
					console.log('finish the game');
					multiPlayerUnsetReady(ws, data);
					updateReadyButton(false);
					updateLobbySlot(data.quantity_player_ready);
					updateLobbyPlayerList(data);
					multiFinishGame();
				} else {
					console.log('wrong game info type has been recieved: ', response.type);
				}
			}
		};
		ws.onclose = (event) => {
			console.log('websocket closed: ', event);
			multiFinishGame();
			disconnectGame();
		}
		ws.onerror = (error) => {
			multiFinishGame();
			disconnectGame();
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
		console.log('error on establishing websocket connection: ', error);
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
		console.log('couldn\'t request to server to create a room: ', error);
		return { 'Error': `${lan.errorFailToLoad}` };
	}
}

export function multiCreateRoom() {
	let roomName = document.getElementById('room-name-input').value;
	if (!roomName) {
		document.getElementById('room-name-input').style.border = '2px solid red';
		return;
	}
	// modalClose();
	console.log('sending request to create room...');
	let mainPart = document.getElementById('app');
	mainPart.innerHTML = '';
	mainPart.appendChild(loadingCircleComponent());
	reqCreateRoom(apiMakeroom, { "room_name": roomName }).then(async (data) => {
		mainPart.innerHTML = '';
		if (data && !data.Error) {
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();

			ws = await multiConnectWs(wsBaseURL, data);

			let mainTitle = document.getElementById('main-title');
			mainTitle.innerHTML = data.room_name;

			let room = await getRoomPlayerInfo(apiBaseURL + data.room_id);
			if (data.status === 'create') {
				mainPart.appendChild(lobbyComponent(ws, data, room));
			}
		} else {
			console.groupCollapsed('server responded with error');
			console.log('data: ', data);
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

async function getRoomPlayerInfo(url="") {
	try {
		let roomInfo = await fetch(url).then(async (response) => {
			return await response.json();
		});
		return roomInfo;
	} catch {
		console.log('failed to fetch data from the server');
	}
}

export function multiJoinRoom() {
	console.log('sending request to join room...');
	let mainPart = document.getElementById('app');
	const room_id = this.id;
	mainPart.innerHTML = '';
	mainPart.appendChild(loadingCircleComponent());
	reqJoinRoom(apiJoinroom, room_id).then(async (data) => {
		mainPart.innerHTML = '';
		if (data && !data.Error) {
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();

			ws = await multiConnectWs(wsBaseURL, data);

			let mainTitle = document.getElementById('main-title');
			mainTitle.innerHTML = data.room_name;
			
			let room = await getRoomPlayerInfo(apiBaseURL + room_id);
			if (data.status === 'join') {
				mainPart.appendChild(lobbyComponent(ws, data, room));
			} else if (data.status === 'reconnect') {
				mainPart.appendChild(lobbyComponent(ws, data, room));
				multiStartGame();
			}
		} else {
			console.groupCollapsed('server responded with error');
			console.log('data: ', data);
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
		console.log('couldn\'t request to server to get list room: ', error);
		return { 'Error': `${lan.errorFailToLoad}` };
	}
}

export function multiListRoom() {
	console.log('sending request to list room...');
	let mainPart = document.getElementById('app');
	mainPart.innerHTML = '';
	mainPart.appendChild(loadingCircleComponent());
	getListRoom(apiListroom).then((data) => {
		mainPart.innerHTML = '';
		if (data.length === 0) {
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();
			let d = document.createElement('div');
			d.className = "d-flex flex-column justify-content-center";
			d.appendChild(responseMsgComponent(`${lan.errorNoLobby}`));
			d.appendChild(lobbyRefreshButtonComponent());
			mainPart.appendChild(d);
		} else if (data && data.length > 0) {
			console.groupCollapsed('server responded successfully');
			console.log('data: ', data);
			console.groupEnd();
			let d = document.createElement('div');
			d.className = "d-flex flex-column justify-content-center";
			d.appendChild(lobbyListRoomComponent(data));
			d.appendChild(lobbyRefreshButtonComponent());
			mainPart.appendChild(d);
		} else {
			console.groupCollapsed('server responded with error');
			console.log('data: ', data);
			console.groupEnd();
			mainPart.appendChild(responseMsgComponent(data.Error));
		}
	});
};
