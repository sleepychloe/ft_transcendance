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

function lobbyComponent() {
	return `<div class="lobby-space-counter">1/4 are ready</div>
                <div class="lobby-players-list">
                        <div class="lobby-players-list-item">
                                <div class="lobby-players-card" id="player1">
                                        <div class="lobby-players-card-icon"><img class="img-player-icon" src="../../assets/img/user-person-single-id-account-player-male-female-512.webp" alt="playerIcon" /></div>
                                        <div class="lobby-players-card-name">Player 1</div>
                                        <div class="lobby-players-card-option"></div>
                                </div>
                        </div>
                </div>
                <div class="game-start">
                        <button class="btn-game-start">Start Game</button>
                </div>`
};

function lobbyListRoomComponent(data) {
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

function lobbyPlayersReadyComponent() {
	let lobbySlot = document.createElement('div');
	lobbySlot.classList.add('lobby-space-counter');
	// need to pass ready players count
	lobbySlot.innerHTML = '1/4 are ready';
	return lobbySlot;
}

function lobbyListPlayersComponent(room) {
	let lobbyPlayerList;
	try {
		lobbyPlayerList = document.createElement('div');
		lobbyPlayerList.classList.add('lobby-players-list');
		for (let i = 0; i < room.quantity_player; i++)
		{
			let listItem = document.createElement('div');
			listItem.classList.add('lobby-players-list-item');
			lobbyPlayerList.appendChild(listItem);
			
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
			playersName.setAttribute("id", "player" + (i + 1));
			playersName.innerHTML = "Player " + (i + 1);
			playersCard.appendChild(playersName);

			let playerOption = document.createElement('div');
			playerOption.classList.add('lobby-players-card-option');
			playersCard.appendChild(playerOption);
		}
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
	console.log('ws3: ', ws);
	btnReady.addEventListener('click', function() {
		multiPlayerSetReady(
			ws,
			{ 'user_status': 1, 'n_client': data.N_client },
		);
	});
	buttonDiv.appendChild(btnReady);
	
	return buttonDiv;
}

function responseMsgComponent(text="fatal error") {
	let msg = document.createElement('p');
	msg.classList.add('list-room-status-msg');
	msg.innerHTML = text;

	return msg;
}
