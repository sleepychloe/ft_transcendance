const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

let normalCount = 0;
let random = 0;///fix it

function updateAIModeVisibility() {
    const aiModeButton = document.getElementById("aiMode");
    if (normalCount < 3) {
        document.getElementById("aiMode").classList.add("hidden");
    } else {
        document.getElementById("aiMode").classList.remove("hidden");
    }
}

document.getElementById("normalMode").addEventListener("click", startNormalMode);
document.getElementById("tournamentMode").addEventListener("click", startTournamentMode);
updateAIModeVisibility();

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
    if (isGameInProgress) {
        let winner = score1 > score2 ? 'Player 1' : 'Player 2';

        isGameInProgress = false;
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        alert(`Winner: ${winner}`);
        normalCount++;
        resetToHomeScreen();
        updateAIModeVisibility();
    }
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
    if (numPlayers >= 3) {
        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Player ${i}`;
            input.id = `player${i}`;
            playerInputs.appendChild(input);
        }
        document.getElementById("registerPlayersButton").classList.remove("hidden");
    }
    else {
        alert(`At least 3 players required !`);
        document.getElementById("registerPlayersButton").classList.add("hidden");
    }
}

function registerPlayers() {
    if (!isGameInProgress) {
        const numPlayers = parseInt(document.getElementById("numPlayers").value);
        players = [];
        let usedNames = new Set();
        for (let i = 1; i <= numPlayers; i++) {
            let playerName = document.getElementById(`player${i}`).value.trim();
            if (!playerName) {
                playerName = "Player " + i.toString();
            }
            while (usedNames.has(playerName) || /^\d+$/.test(playerName)) {
                playerName = prompt(`Please enter a new name for Player ${i}:`).trim();
                if (!playerName) {
                    playerName = "Player " + i.toString();
                }
            }
            usedNames.add(playerName);
            players.push(playerName);
        }
        delete usedNames;
        if (players.length % 2 !== 0) {
            players.push(players.shift());
        }
        currentMatchIndex = 0;
        displayMatchups();
        document.getElementById("registerPlayersButton").classList.add("hidden");
        document.getElementById("registration").style.display = "none";
        startMatch();
        isGameInProgress = true;
    }
}

// Game
let leftPaddleY = canvas.height / 2;
let rightPaddleY = canvas.height / 2;
const paddleWidth = 10, paddleHeight = 100, paddleSpeed = 14;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = Math.random() > 0.5 ? 2 + Math.random() : -2 - Math.random();
let ballSpeedY = Math.random() > 0.5 ? 2 + Math.random() : -2 - Math.random();
let temp = Math.random() > 0.5 ? 1 : -1;
ballSpeedX *= temp;


const ballSize = 10;
let score1 = 0, score2 = 0;
let players = [];
let currentMatchIndex = 0;
let gameLoopId = 0;
let normalModeGamesPlayed = 0;
let tournamentModeFlag = 0;
let isGameInProgress = false;

document.addEventListener('keydown', event => {
    if (event.key === 'w') leftPaddleY -= paddleSpeed;
    if (event.key === 's') leftPaddleY += paddleSpeed;
    if (event.key === 'ArrowUp') rightPaddleY -= paddleSpeed;
    if (event.key === 'ArrowDown') rightPaddleY += paddleSpeed;
    if (event.key === 'f5')
    {
        event.preventDefault();
        resetToHomeScreen()
    }
});

function resetBall() {
    ballX = canvas.width / 2, ballY = canvas.height / 2;
    ballSpeedX = Math.random() > 0.5 ? 2 + Math.random() : -2 - Math.random();
    ballSpeedY = Math.random() > 0.5 ? 2 + Math.random() : -2 - Math.random();
    temp = Math.random() > 0.5 ? 1 : -1;
    ballSpeedX *= temp;

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
    if ((ballX <= paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ||
        (ballX >= canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)) {
        ballSpeedX = -ballSpeedX;
    }
}

function checkScore() {
    // Normal mode
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
            random++;
            endNormalGame();
        }
    }
    // Tournament mode
    if (tournamentModeFlag && (ballX < 0 || ballX > canvas.width)) {
        if (ballX < 0) score2++;
        else score1++;
        document.getElementById("score1").textContent = score1;
        document.getElementById("score2").textContent = score2;
        if (score1 >= 1 || score2 >= 1) {
            random++;
            endMatch();
        } else {
            startMatch();
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
    if (!isGameInProgress) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return ;
    }
        updatePaddlePosition();
    if (random % 2 !== 0) {
        ballX -= ballSpeedX;
        ballY -= ballSpeedY;
    }
    else {
        ballX += ballSpeedX;
        ballY += ballSpeedY;
    }
    if (ballY <= 5 || ballY >= canvas.height - 5) ballSpeedY = -ballSpeedY;
    paddleCollision();
    checkScore();

    drawEverything();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function startMatch() {
    random++;
    resetBall();
    if (tournamentModeFlag) {
        document.getElementById("tournamentInfo").style.display = "block";
    }
    if (!gameLoopId) {
        isGameInProgress = true;
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
        if (isGameInProgress === true) {
            alert(`Tournament Winner: ${winner}`);
            isGameInProgress = false;
            if (gameLoopId){
                cancelAnimationFrame(gameLoopId);
                gameLoopId = null;
            }
            resetToHomeScreen();
        }
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
    isGameInProgress = false;
	if (gameLoopId) {
	    cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    gameLoopId = null;
    score1 = 0;
    score2 = 0;
    document.getElementById("score1").textContent = score1;
    document.getElementById("score2").textContent = score2;
    for (let i = 1; i <= document.getElementById("numPlayers").value; i++) {
        document.getElementById(`player${i}`).value = "";
    }
    document.getElementById("numPlayers").value = "empty";
    document.getElementById("playerInputs").innerHTML = '';
    players = [];
    currentMatchIndex = 0;
}

function resetToHomeScreen() {
    resetBall();
    resetGame();
    document.getElementById("pongCanvas").style.display = "block";
    document.getElementById("gameDashboard").style.display = "none";
    document.getElementById("tournamentInfo").style.display = "none";
    document.getElementById("modeSelection").style.display = "block";
    tournamentModeFlag = 0;
    updateAIModeVisibility();
}
