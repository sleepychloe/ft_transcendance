const trans = {
	en: {
		areReady: "are ready",
		ready: "Ready",
		undo: "Undo",
		client: "Client",
		errorSearchingLobby: "error while searching lobby",
		errorLoadingLobby: "error while loading lobby",

	},
	fr: {
		areReady: "sont prêts",
		ready: "Prêt",
        	undo: "Annuler",
		client: "Client",
	},
	ko: {
		areReady: "준비됨",
		ready: "준비됨",
        	undo: "실행 취소",
		client: "클라이언트",
	},
};

const l = trans[currentLanguage];

function multiGameScreenComponent() {
	let container = document.createElement('div');
	container.classList.add('game');

	let gameCanvas = document.createElement('canvas');
	gameCanvas.setAttribute('id', 'pongCanvas');
	gameCanvas.setAttribute('width', '800');
	gameCanvas.setAttribute('height', '400');
	
	container.appendChild(gameCanvas);
	return container;
}

function lobbyComponent(ws={}, data={}) {
	let lobby = document.createElement('div');
	lobby.classList.add('lobby');
	lobby.appendChild(lobbyPlayersReadyComponent(data.quantity_player_ready));
	lobby.appendChild(lobbyListPlayersComponent(data.quantity_player));
	lobby.appendChild(lobbyReadyButtonComponent(ws, data.n_client));
	return lobby;
}

function lobbyListRoomComponent(data={}) {
	let lobbyRoomList;
	var i = 0;
	try {
		lobbyRoomList = document.createElement('div');
		lobbyRoomList.classList.add('lobby-room-list');
		for (i in data)
		{
			let listItem = document.createElement('div');
			listItem.classList.add('lobby-room-list-item');
			listItem.addEventListener('click', multiJoinRoom);
			lobbyRoomList.appendChild(listItem);
			
			let roomCard = document.createElement('div');
			roomCard.classList.add('lobby-room-card');
			listItem.appendChild(roomCard);
			
			let roomName = document.createElement('div');
			roomName.classList.add('lobby-room-card-name');
			roomName.setAttribute('id', data[i].room_id);
			roomName.innerHTML = data[i].room_name;
			roomCard.appendChild(roomName);

			let roomSlot = document.createElement('div');
			roomSlot.classList.add('lobby-room-card-slot');
			roomSlot.innerHTML = data[i].quantity_player + "/4";
			roomCard.appendChild(roomSlot);
		}
	} catch {
		return responseMsgComponent(`${l.errorSearchingLobby}`);
	}
	return lobbyRoomList;
}

function lobbyPlayersReadyComponent(quantity_player_ready=0) {
	let lobbySlot = document.createElement('div');
	lobbySlot.classList.add('lobby-space-counter');
	lobbySlot.innerHTML = quantity_player_ready + '/4 ' + `${l.areReady}`;
	return lobbySlot;
}

function lobbyPlayersListItemComponent(playerId="client", n=0) {
	let listItem = document.createElement('div');
	listItem.classList.add('lobby-players-list-item');
	listItem.setAttribute("id", playerId);
	
	let playersCard = document.createElement('div');
	playersCard.classList.add('lobby-players-card');
	listItem.appendChild(playersCard);
	let playerIcon = document.createElement('div');
	playerIcon.classList.add('lobby-players-card-icon');
	playersCard.appendChild(playerIcon);

	let iconImage = document.createElement('img');
	iconImage.classList.add('img-player-icon');
	iconImage.src = '/static/assets/img/user-person-single-id-account-player-male-female-512.webp';
	iconImage.alt = 'playerIcon';
	playerIcon.appendChild(iconImage);

	let playersName = document.createElement('div');
	playersName.classList.add('lobby-players-card-name');
	playersName.innerHTML = `${l.client}` + n;
	playersCard.appendChild(playersName);

	let playerOption = document.createElement('div');
	playerOption.classList.add('lobby-players-card-option');
	playersCard.appendChild(playerOption);

	return listItem;
}

function lobbyListPlayersComponent(quantity_player=0) {
	let lobbyPlayerList = document.createElement('div');
	lobbyPlayerList.classList.add('lobby-players-list');
	try {
		for (let i = 0; i < quantity_player; i++) {
			lobbyPlayerList.appendChild(lobbyPlayersListItemComponent('client' + (i + 1), i));
		}
	} catch {
		return responseMsgComponent(`${l.errorLoadingLobby}`);
	}
	// console.log("lobbyPlayerList: ", lobbyPlayerList);
	return lobbyPlayerList;
}

function lobbyReadyButtonComponent(ws={}, n_client="client") {
	let buttonDiv = document.createElement('div');
	buttonDiv.classList.add('game-start');

	let btnReady = document.createElement('button');
	btnReady.classList.add('btn-game-start');
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
	btnUnready.classList.add('btn-game-start');
	btnUnready.classList.add('ready');
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

function responseMsgComponent(text="error") {
	let msg = document.createElement('p');
	msg.classList.add('list-room-status-msg');
	msg.innerHTML = text;

	return msg;
}

function loadingCircleComponent() {
	let loader = document.createElement('div');
	loader.classList.add('loading');
	loader.style.visibility = 'visible';

	return loader;
}

function lobbyRefreshButtonComponent() {
	let refresh = document.createElement('div');
	refresh.classList.add('lobby-refresh');
	refresh.style.cursor = 'pointer';
	refresh.addEventListener('click', multiListRoom);

	let refreshImage = document.createElement('img');
	refreshImage.classList.add('img-refresh-icon');
	refreshImage.src = '/static/assets/img/refresh.png';
	refreshImage.alt = 'refreshIcon';

	refresh.appendChild(refreshImage);
	return refresh;
}
