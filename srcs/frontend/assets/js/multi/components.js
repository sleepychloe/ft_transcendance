function multiDefaultPageComponent() {
        return `<div class="multi-room-choice-list">
                        <div class="multi-room-choice-list-item"><button class="btn-multi-room-select" onClick="multiCreateRoom()">Create Game</button></div>
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
        const listRoom = JSON.parse(data);

        Object.entries(listRoom).forEach((entry) => {
                const [key, value] = entry;
                console.log(`${key}: ${value}`);
        });
}
