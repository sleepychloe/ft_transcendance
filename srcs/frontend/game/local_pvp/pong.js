var canvas = document.getElementById("pongCanvas");
var ctx = canvas.getContext("2d");

let normalCount = 0;
let random = 0;

// moved to game/local_pvp/page.js:6 inside HTML button tag
// document.getElementById("normalMode").addEventListener("click", startNormalMode);

function canvasInit() {
    canvas = document.getElementById("pongCanvas");
    ctx = canvas.getContext("2d");
}

function startNormalMode() {
    canvasInit();
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
    }
}

let leftPaddleY = canvas.height / 2;
let rightPaddleY = canvas.height / 2;
const paddleWidth = 10, paddleHeight = 100, paddleSpeed = 14;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 2 + 1.5 * Math.random();
let ballSpeedY = 2 + 1.5 * Math.random();

const ballSize = 10;
let score1 = 0, score2 = 0;
let players = [];
let currentMatchIndex = 0;
let gameLoopId = 0;
let normalModeGamesPlayed = 0;
let isGameInProgress = false;


document.addEventListener('keydown', event => {
    if (isGameInProgress && event.key === 'w') {
        leftPaddleY -= paddleSpeed;
        const data = {
            "PaddleY": leftPaddleY,
            "ballX": ballX,
            "ballY": ballY
        };
        postJSON(data);
    }
    if (isGameInProgress && event.key === 's') {
        leftPaddleY += paddleSpeed;
        const data = {
            "PaddleY": leftPaddleY,
            "ballX": ballX,
            "ballY": ballY
        };
        postJSON(data);
    }
    if (isGameInProgress && event.key === 'ArrowUp') {
        rightPaddleY -= paddleSpeed;
        const data = {
            "PaddleY": leftPaddleY,
            "ballX": ballX,
            "ballY": ballY
        };
        postJSON(data);
    }
    if (isGameInProgress && event.key === 'ArrowDown') {
        rightPaddleY += paddleSpeed;
        const data = {
            "PaddleY": leftPaddleY,
            "ballX": ballX,
            "ballY": ballY
        };
        postJSON(data);
    }
    if (event.key === 'f5') {
        event.preventDefault();
        resetToHomeScreen()
    }
});

function resetBall() {
    ballX = canvas.width / 2, ballY = canvas.height / 2;
    ballSpeedX = 2 + 1.5 * Math.random();
    ballSpeedY = 2 + 1.5 * Math.random();

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
    if ((ballX < 0 || ballX > canvas.width)) {
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
        return;
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
    if (!gameLoopId) {
        isGameInProgress = true;
        gameLoopId = requestAnimationFrame(gameLoop);
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
    document.getElementById("modeSelection").style.display = "block";

}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function postJSON(data) {
    try {
        const response = await fetch('/api/ml_save_data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        console.log("success: ", result);
    } catch (error) {
        console.error("error: ", error);
    }
}
