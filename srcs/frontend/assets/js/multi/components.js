import { multiListRoom } from '/static/game/multi/pongMulti.js';
import { multiJoinRoom } from '/static/game/multi/pongMulti.js';
import { multiPlayerSetReady } from '/static/game/multi/pongMulti.js';
import { multiPlayerUnsetReady } from '/static/game/multi/pongMulti.js';

const trans = {
	en: {
	    areReady: "are ready",
	    ready: "Ready",
	    undo: "Undo",
	    client: "Client",
	    errorSearchingLobby: "error while searching lobby",
	    errorLoadingLobby: "error while loading lobby",
	    score: "Score",
	    team1: "Team 1",
	    team2: "Team 2",
	},
	fr: {
	    areReady: "sont prêts",
	    ready: "Prêt",
	    undo: "Annuler",
	    client: "Client",
	    errorSearchingLobby: "erreur lors de la recherche du lobby",
	    errorLoadingLobby: "erreur lors du chargement du lobby",
	    score: "Score",
	    team1: "Équipe 1",
            team2: "Équipe 2",
	},
	ko: {
	    areReady: "준비됨",
	    ready: "준비됨",
	    undo: "실행 취소",
	    client: "클라이언트",
	    errorSearchingLobby: "로비 검색 중 오류",
	    errorLoadingLobby: "로비 로딩 중 오류",
	    score: "점수",
	    team1: "팀 1",
	    team2: "팀 2",
	},
    };

const l = trans[currentLanguage];

export function multiGameScoreComponent() {
	let scoreboard = document.createElement('div');
	scoreboard.className = "d-flex flex-row justify-content-center fs-1 text-white";
	scoreboard.setAttribute('id', 'scoreboard');
	scoreboard.innerHTML = "0 : 0";

	return scoreboard;
}

export function multiGameScreenComponent() {
	let container = document.createElement('div');
	container.setAttribute('id', 'game');
	container.className = "d-flex";

	let gameCanvas = document.createElement('canvas');
	gameCanvas.setAttribute('id', 'pongCanvas');
	
	container.appendChild(gameCanvas);
	return container;
}

export function lobbyComponent(ws={}, data={}, room={}) {
	let lobby = document.createElement('div');
	lobby.setAttribute('id', 'lobby');
	lobby.className = "d-flex flex-column justify-content-center";
	console.log('lobbyComponent: ', room);
	lobby.appendChild(lobbyPlayersReadyComponent(data.quantity_player_ready));
	lobby.appendChild(lobbyListPlayersComponent(data.quantity_player, room));
	lobby.appendChild(lobbyReadyButtonComponent(ws, data.n_client));
	return lobby;
}

export function lobbyListRoomComponent(data={}) {
	let lobbyRoomList;
	var i = 0;
	try {
		lobbyRoomList = document.createElement('div');
		lobbyRoomList.className = 'd-flex flex-column justify-content-center';
		for (i in data)
		{
			let listItem = document.createElement('div');
			listItem.className = 'd-flex flex-row justify-content-between px-4 p-2 m-auto mb-2 btn btn-outline-primary';
			listItem.style['width'] = "20vw";
			listItem.style['height'] = "38px";
			listItem.style['min-width'] = "278px";
			listItem.addEventListener('click', multiJoinRoom);
			listItem.setAttribute('id', data[i].room_id);
			lobbyRoomList.appendChild(listItem);

			let roomName = document.createElement('div');
			roomName.className = 'd-flex';
			roomName.innerHTML = data[i].room_name;
			listItem.appendChild(roomName);

			let roomSlot = document.createElement('div');
			roomSlot.className = 'd-flex';
			roomSlot.innerHTML = data[i].quantity_player + "/4";
			listItem.appendChild(roomSlot);
		}
	} catch {
		return responseMsgComponent(`${l.errorSearchingLobby}`);
	}
	return lobbyRoomList;
}

function lobbyPlayersReadyComponent(quantity_player_ready=0) {
	let lobbySlot = document.createElement('div');
	lobbySlot.setAttribute('id', 'lobby-space-counter');
	lobbySlot.className = "d-flex flex-column justify-content-center text-center m-auto fs-5 text-danger mb-3";
	lobbySlot.innerHTML = quantity_player_ready + '/4 ' + `${l.areReady}`;
	return lobbySlot;
}

function lobbyPlayersListItemComponent(playerId="client", n=0, room={}) {
	console.log('lobbyPlayersListItemComponent:room: ', room);
	let listItem = document.createElement('div');
	listItem.className = 'd-flex flex-column justify-content-center mb-1';
	listItem.setAttribute("id", playerId);
	
	let playersCard = document.createElement('div');
	playersCard.className = 'd-flex flex-row card';
	playersCard.style['height'] = "4rem";
	playersCard.style['width'] = "15rem";
	listItem.appendChild(playersCard);

	let iconBox = document.createElement('div');
	iconBox.className = 'd-flex';
	iconBox.style['height'] = "100%";
	iconBox.style['width'] = "100%";
	playersCard.appendChild(iconBox);

	let iconImage = document.createElement('img');
	iconImage.className = 'card-img-left';
	iconImage.src = room.avatar;
	iconImage.alt = 'playerIcon';
	iconImage.style['border-radius'] = "50%"
	iconBox.appendChild(iconImage);

	let playersName = document.createElement('div');
	playersName.className = 'd-flex justify-content-center card-title text-center text-md-start fs-5 m-auto';
	playersName.innerHTML = room.intra_id;//`${l.client}` + n;
	iconBox.appendChild(playersName);

	return listItem;
}

export function lobbyListPlayersComponent(quantity_player=0, room={}) {
	let lobbyPlayerList = document.createElement('div');
	lobbyPlayerList.setAttribute('id', 'lobby-players-list');
	lobbyPlayerList.className = "d-flex flex-column justify-content-center";
	let players = [];
	for (var x in room) {
		players.push(room[x]);
	}
	console.log('players: ', players);
	try {
		for (let i = 0; i < quantity_player; i++) {
			lobbyPlayerList.appendChild(lobbyPlayersListItemComponent('client' + (i + 1), (i + 1), players[i]));
		}
	} catch {
		return responseMsgComponent(`${l.errorLoadingLobby}`);
	}
	// console.log("lobbyPlayerList: ", lobbyPlayerList);
	return lobbyPlayerList;
}

function lobbyReadyButtonComponent(ws={}, n_client="client") {
	let buttonDiv = document.createElement('div');
	buttonDiv.className = 'd-flex justify-content-center m-auto w-100 mt-4';

	let btnReady = document.createElement('button');
	btnReady.className = 'justify-content-center btn btn-success w-50 m-auto d-flex';
	btnReady.setAttribute('id', 'btn-multi-ready');
	btnReady.innerHTML = `${l.ready}`;
	btnReady.addEventListener('click', () => {
		multiPlayerSetReady(
			ws,
			{
				'action': 'update',
				'type': 'ready_status',
				'data': {
					'n_client': n_client,
				},
			},
		);
	});
	let btnUnready = document.createElement('button');
	btnUnready.className = 'justify-content-center btn btn-danger w-50 m-auto d-none';
	btnUnready.setAttribute('id', 'btn-multi-unready');
	btnUnready.innerHTML = `${l.undo}`;
	btnUnready.addEventListener('click', () => {
		multiPlayerUnsetReady(
			ws,
			{
				'action': 'update',
				'type': 'unready_status',
				'data': {
					'n_client': n_client,
				},
			},
		);
	});
	buttonDiv.appendChild(btnReady);
	buttonDiv.appendChild(btnUnready);
	
	return buttonDiv;
}

export function responseMsgComponent(text="error") {
	let msg = document.createElement('p');
	msg.setAttribute('id', 'status-msg');
	msg.className = "d-flex justify-content-center fs-4 text-muted p-2 m-auto";
	msg.innerHTML = text;

	return msg;
}

export function loadingCircleComponent() {
	let loader = document.createElement('div');
	loader.setAttribute('id', 'loading');
	loader.setAttribute('role', 'status');
	loader.className = "spinner-border text-light p-2 m-auto";

	return loader;
}

export function lobbyRefreshButtonComponent() {
	let btnRefresh = document.createElement('button');
	btnRefresh.setAttribute('id', 'btn-refresh');
	btnRefresh.className = "btn btn-outline-warning m-auto mt-0 mb-5 px-3";
	btnRefresh.addEventListener('click', multiListRoom);
	btnRefresh.innerHTML = "Refresh";

	return btnRefresh;
}
