export function tournamentPage() {
        console.log("tournament/page.js : tournamentPage function called");
        return `<div id="modeSelection">
        <h2>Tournament</h2>
        <button id="normalMode" class="hidden">Start</button>
        <button id="tournamentMode">Start</button>
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
    </div>
    <canvas id="pongCanvas" width="800" height="400" class="hidden"></canvas>`
};
