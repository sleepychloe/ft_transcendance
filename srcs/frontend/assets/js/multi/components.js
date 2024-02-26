function multiDefaultPageComponent() {
	return `<div class="modal">
			<div class="modal-content">
				<input type="text" id="room-name-input" placeholder="Lobby Name" minlength="1" maxlength="16" required />
				<button class="btn-modal-input-submit" onClick="multiCreateRoom()">Create</button>
			</div>
		</div>
		<div class="overlay"></div>
		<div class="multi-room-choice-list">
			<div class="multi-room-choice-list-item"><button class="btn-multi-room-select" onClick="modalShow()">Create Game</button></div>
			<div class="multi-room-choice-list-item"><button class="btn-multi-room-select" onClick="multiJoinRoom()">Join Game</button></div>
		</div>`
}

function multiGameScreenComponent() {
	let gameCanvas = document.createElement('canvas');
	gameCanvas.setAttribute('id', 'pongCanvas');
	gameCanvas.setAttribute('width', '800');
	gameCanvas.setAttribute('height', '400');
	return gameCanvas;
}

function lobbyListRoomComponent(data={}) {
	let lobbyRoomList;
	var i = 0;
	try {
		// single element - top (parent)
		lobbyRoomList = document.createElement('div');
		lobbyRoomList.classList.add('lobby-room-list');
		for (i in data)
		{
			// generated elements depending on server response (children)
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
		return responseMsgComponent('error while searching lobby');
	}
	return lobbyRoomList;
}

function lobbyPlayersReadyComponent(quantity_player_ready=0) {
	let lobbySlot = document.createElement('div');
	lobbySlot.classList.add('lobby-space-counter');
	lobbySlot.innerHTML = quantity_player_ready + '/4 are ready';
	return lobbySlot;
}

function lobbyPlayersListItemComponent(playerId="player") {
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
	iconImage.src = '../../assets/img/user-person-single-id-account-player-male-female-512.webp';
	iconImage.alt = 'playerIcon';
	playerIcon.appendChild(iconImage);

	let playersName = document.createElement('div');
	playersName.classList.add('lobby-players-card-name');
	playersName.innerHTML = playerId;
	playersCard.appendChild(playersName);

	let playerOption = document.createElement('div');
	playerOption.classList.add('lobby-players-card-option');
	playersCard.appendChild(playerOption);

	return listItem;
}

function lobbyListPlayersComponent(room={}) {
	let lobbyPlayerList = document.createElement('div');
	lobbyPlayerList.classList.add('lobby-players-list');
	try {
		for (let i = 0; i < room.quantity_player - 1; i++) {
			lobbyPlayerList.appendChild(lobbyPlayersListItemComponent("client" + (i + 1)));
		}
		lobbyPlayerList.appendChild(lobbyPlayersListItemComponent(room.n_client));
	} catch {
		return responseMsgComponent('error while loading lobby');
	}
	// console.log("lobbyPlayerList: ", lobbyPlayerList);
	return lobbyPlayerList;
}

function lobbyReadyButtonComponent(ws={}, data={}) {
	let buttonDiv = document.createElement('div');
	buttonDiv.classList.add('game-start');

	let btnReady = document.createElement('button');
	btnReady.classList.add('btn-game-start');
	btnReady.innerHTML = 'Ready';
	btnReady.addEventListener('click', () => {
		multiPlayerSetReady(
			ws,
			{
				'action': 'update',
				'type': 'ready_status',
				'data': {
					'n_client': data.n_client,
				},
			},
		);
	});
	let btnUnready = document.createElement('button');
	btnUnready.classList.add('btn-game-start');
	btnUnready.classList.add('ready');
	btnUnready.innerHTML = 'Undo';
	btnUnready.addEventListener('click', () => {
		multiPlayerUnsetReady(
			ws,
			{
				'action': 'update',
				'type': 'unready_status',
				'data': {
					'n_client': data.n_client,
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
