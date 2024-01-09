const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");


document.getElementById("normalMode").addEventListener("click", startNormalMode);
document.getElementById("tournamentMode").addEventListener("click", startTournamentMode);


// Normal mode
function startNormalMode() {
	resetGame();
    normalModeGamesPlayed = 0;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("gameDashboard").style.display = "block";
    document.getElementById("pongCanvas").style.display = "block";
    startMatch();
}

function endNormalGame() {
    let winner = score1 > score2 ? 'Player 1' : 'Player 2';
    // alert(`Winner: ${winner}`);
	cancelAnimationFrame(gameLoopId);
    resetToHomeScreen();
}


// Tournament mode
function startTournamentMode() {
	resetGame();
    tournamentModeFlag = 1;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("registration").style.display = "block";
}

function createPlayerInputs() {
    const numPlayers = parseInt(document.getElementById("numPlayers").value);
    const playerInputs = document.getElementById("playerInputs");
    playerInputs.innerHTML = '';

    if (numPlayers >= 3)
    {
        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Player ${i} Name`;
            input.id = `player${i}`;
            playerInputs.appendChild(input);
        }
        document.getElementById("registerPlayersButton").classList.remove("hidden");
    }
    else
    {
        document.getElementById("registerPlayersButton").classList.add("hidden");
    }
}
    

function registerPlayers() {
    const numPlayers = parseInt(document.getElementById("numPlayers").value);
    players = [];

    for (let i = 1; i <= numPlayers; i++) {
        const playerName = document.getElementById(`player${i}`).value;
        if (playerName) {
            players.push(playerName);
        }
    }

    if (players.length % 2 !== 0) {
        players.push(players.shift());
    }

    currentMatchIndex = 0;
    displayMatchups();
    document.getElementById("registerPlayersButton").classList.add("hidden");
    document.getElementById("registration").style.display = "none";
    startMatch();
}


// Game
let leftPaddleY = canvas.height / 2;
let rightPaddleY = canvas.height / 2;
const paddleWidth = 10, paddleHeight = 100, paddleSpeed = 4;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = Math.random() > 0.5 ? 2 : -2;
let ballSpeedY = Math.random() > 0.5 ? 2 : -2;
const ballSize = 10;
let score1 = 0, score2 = 0;
let players = [];
let currentMatchIndex = 0;
let gameLoopId = 0;
let normalModeGamesPlayed = 0;
let tournamentModeFlag = 0;

document.addEventListener('keydown', event => {
    if (event.key === 'w') leftPaddleY -= paddleSpeed;
    if (event.key === 's') leftPaddleY += paddleSpeed;
    if (event.key === 'ArrowUp') rightPaddleY -= paddleSpeed;
    if (event.key === 'ArrowDown') rightPaddleY += paddleSpeed;
});

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
	ballSpeedX = Math.random() > 0.5 ? 2 : -2;
    ballSpeedY = Math.random() > 0.5 ? 2 : -2;
	leftPaddleY = canvas.height / 2;
	rightPaddleY = canvas.height / 2;
}

function updatePaddlePosition() {
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY + paddleHeight > canvas.height) leftPaddleY = canvas.height - paddleHeight;
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (rightPaddleY + paddleHeight > canvas.height) rightPaddleY = canvas.height - paddleHeight;
}

function paddleCollision() {
    if (ballX <= paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight ||
        ballX >= canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
    }
}

function checkScore() {
    if (!tournamentModeFlag && (ballX < 0 || ballX > canvas.width)) {
        if (ballX < 0) score2++;
        else score1++;

        document.getElementById("score1").textContent = score1;
        document.getElementById("score2").textContent = score2;

        normalModeGamesPlayed++;

        if (normalModeGamesPlayed < 3 &&
            Math.max(score1, score2) < 2) {
            startMatch();
        } else {
            endNormalGame();
        }
    }
    if (tournamentModeFlag && (ballX < 0 || ballX > canvas.width)) {
        // Tournament mode scoring logic
        if (ballX < 0) score2++;
        else score1++;

        // Update the scoreboard
        document.getElementById("score1").textContent = score1;
        document.getElementById("score2").textContent = score2;

        // Check if the current match is over
        if (score1 >= 1 || score2 >= 1) {
            endMatch();
        } else {
            startMatch(); // Start a new rally in the current match
        }
    }
}

function drawEverything() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2, false);
    ctx.fill();
}

function gameLoop() {
    updatePaddlePosition();
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY <= 0 || ballY >= canvas.height) ballSpeedY = -ballSpeedY;
    paddleCollision();
    checkScore();

    drawEverything();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function startMatch() {
    if (tournamentModeFlag)
        document.getElementById("tournamentInfo").style.display = "block";
    resetBall();
    ballSpeedX = 2; // Reset ball speed
    if (!gameLoopId) {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

function endMatch() {
    let winner = score1 > score2 ? players[0] : players[1];

    players.push(winner);
    players.splice(0, 2);

    if (players.length > 1) {
        displayMatchups();
        startMatch();
    } else {
        // alert(`Tournament Winner: ${winner}`);
		cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
        resetToHomeScreen();
    }
}



function displayMatchups() {
    const currentMatchDisplay = document.getElementById("currentMatch");
    const upcomingMatchesDisplay = document.getElementById("upcomingMatches");


	if (players.length >= 2) {
        currentMatchDisplay.textContent = `${players[0]} vs ${players[1]}`;
    } else {
        currentMatchDisplay.textContent = "Waiting for players";
    }
    upcomingMatchesDisplay.innerHTML = '';
    for (let i = 2; i < players.length; i++) {
        const matchInfo = document.createElement("div");
        matchInfo.textContent = `${players[i]} (next opponent)`;
        upcomingMatchesDisplay.appendChild(matchInfo);
    }
}



function resetGame() {
	if (gameLoopId)
	    cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
    score1 = 0;
    score2 = 0;
    document.getElementById("score1").textContent = score1;
    document.getElementById("score2").textContent = score2;
    players = [];
    currentMatchIndex = 0;
}

function resetToHomeScreen() {
    document.getElementById("pongCanvas").style.display = "block";
    document.getElementById("gameDashboard").style.display = "none";
    document.getElementById("tournamentInfo").style.display = "none";
    document.getElementById("modeSelection").style.display = "block";
    tournamentModeFlag = 0;
}
