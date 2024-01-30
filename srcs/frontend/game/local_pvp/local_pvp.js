function gamePage() {
    return `<html>
    <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pong Game</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="../../assets/css/local_pvp.css" rel="stylesheet">
    </head>
    
    <body id="root">
            <div id="modeSelection">
                    <h2>1 vs 1</h2><button id="normalMode">Start</button><button id="tournamentMode"
                            class="hidden">Tournament Mode</button><button id="aiMode" class="hidden">AI Mode</button>
            </div>
            <div id="registration" class="hidden">
                    <h2>Tournament Registration</h2><input type="number" id="numPlayers"
                            placeholder="Number of Players"><button onclick="createPlayerInputs()">Set Players</button>
                    <div id="playerInputs"></div><button onclick="registerPlayers()" class="hidden"
                            id="registerPlayersButton">Register Players</button>
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
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script src="../pong.js"></script>
    </body>
    
    </html>`
};

export default gamePage;
