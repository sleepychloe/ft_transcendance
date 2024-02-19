export function multiPage() {
        // console.log("multi/page.js : multiPage function called");
        // return `<textarea id="chat-log" cols="100" rows="20"></textarea><br />
        //         <input id="chat-message-input" type="text" size="100"><br />
        //         <input id="chat-message-submit" type="text" size="100"><br />`
        // return `<canvas id="pongCanvas" width="800" height="600"></canvas>`;
        return `<div class="grid">
                        <header>
                                <div class="main-title">Player's Lobby</div>
                        </header>
                        <nav class="navbar">
                                <div class="navbar-list">
                                        <a href="/" class="navbar-list-item">Home</a>
                                        <a href="/local" class="navbar-list-item">Local</a>
                                        <a href="/tournament" class="navbar-list-item">Tournament</a>
                                        <a href="/multi" class="navbar-list-item">Multi</a>
                                </div>
                        </nav>
                        <main class="main-part">
                                <div class="lobby-space-counter">1/4 are ready</div>
                                <div class="lobby-players-list">
                                        <div class="lobby-players-list-item">
                                                <div class="lobby-players-card" id="player1">
                                                        <div class="lobby-players-card-icon"><img class="img-player-icon" src="../../assets/img/user-person-single-id-account-player-male-female-512.webp" alt="playerIcon" /></div>
                                                        <div class="lobby-players-card-name">Player 1</div>
                                                        <div class="lobby-players-card-option"></div>
                                                </div>
                                        </div>
                                        <div class="lobby-players-list-item">
                                                <div class="lobby-players-card" id="player2">
                                                        <div class="lobby-players-card-icon"><img class="img-player-icon" src="../../assets/img/user-person-single-id-account-player-male-female-512.webp" alt="playerIcon" /></div>
                                                        <div class="lobby-players-card-name">Player 2</div>
                                                        <div class="lobby-players-card-option"></div>
                                                </div>
                                        </div>
                                        <div class="lobby-players-list-item">
                                                <div class="lobby-players-card" id="player3">
                                                        <div class="lobby-players-card-icon"><img class="img-player-icon" src="../../assets/img/user-person-single-id-account-player-male-female-512.webp" alt="playerIcon" /></div>
                                                        <div class="lobby-players-card-name">Player 3</div>
                                                        <div class="lobby-players-card-option"></div>
                                                </div>
                                        </div>
                                        <div class="lobby-players-list-item">
                                                <div class="lobby-players-card" id="player4">
                                                        <div class="lobby-players-card-icon"><img class="img-player-icon" src="../../assets/img/user-person-single-id-account-player-male-female-512.webp" alt="playerIcon" /></div>
                                                        <div class="lobby-players-card-name">Player 4</div>
                                                        <div class="lobby-players-card-option"></div>
                                                </div>
                                        </div>
                                </div>
                                <div class="game-start">
                                        <button class="btn-game-start">Start Game</button>
                                </div>
                        </main>
                        <footer></footer>
                </div>`
};
