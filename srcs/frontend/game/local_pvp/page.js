export function localpvpPage() {
        // console.log("local_pvp/page.js : localpvpPage function called");
        return `<div class="grid">
                        <header>
                                <div class="main-title">Local Game</div>
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
                                <div id="modeSelection">
                                        <h2>1 vs 1</h2>
                                        <button id="normalMode" onClick="startNormalMode()">Start</button><button id="tournamentMode" class="hidden">Tournament Mode</button>
                                        <button id="aiMode" class="hidden">AI Mode</button>
                                </div>
                                <div id="registration" class="hidden">
                                        <h2>Tournament Registration</h2>
                                        <input type="number" id="numPlayers" placeholder="Number of Players">
                                        <button onclick="createPlayerInputs()">Set Players</button>
                                        <div id="playerInputs"></div>
                                        <button onclick="registerPlayers()" class="hidden" id="registerPlayersButton">Register Players</button>
                                </div>
                                <div id="gameDashboard" class="hidden">
                                        <h2>Score</h2>
                                        <p>Player 1: <span id="score1">0</span></p>
                                        <p>Player 2: <span id="score2">0</span></p>
                                </div>
                                <div id="tournamentInfo" class="hidden">
                                        <h2>Current Match</h2>
                                        <p id="currentMatch"></p>
                                        <h3>Upcoming Matches</h3>
                                        <ul id="upcomingMatches"></ul>
                                </div><canvas id="pongCanvas" width="800" height="400" class="hidden"></canvas>
                        </main>
                        <footer></footer>
                </div>`
};
