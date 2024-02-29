const translations = {
    en: {
        player: "Player",
        vs: "vs",
        alertPlayerNum: "3 to 6 players required !",
        alertTournamentWinner: "Tournament Winner",
        alertWinner: "Winner",
        waiting: "Waiting for players",
        next: "next opponent",
    },
    fr: {
        player: "Joueur",
        vs: "contre",
        alertPlayerNum: "De 3 à 6 joueurs requis !",
        alertTournamentWinner: "Vainqueur du tournoi",
        alertWinner: "Vainqueur",
        waiting: "En attente des joueurs",
        next: "prochain adversaire",
    },
    ko: {
        player: "플레이어",
        vs: "대",
        alertPlayerNum: "3명에서 6명의 플레이어가 필요합니다 !",
        alertTournamentWinner: "토너먼트 우승자",
        alertWinner: "우승자",
        waiting: "플레이어를 기다리는 중",
        next: "다음 상대",
    },
};

const t = translations[currentLanguage];


var canvas = document.getElementById("pongCanvas");
var ctx = canvas.getContext("2d");

let normalCount = 0;
let random = 0;

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
let tournamentModeFlag = 0;

function canvasInit() {
    canvas = document.getElementById("pongCanvas");
    ctx = canvas.getContext("2d");
}

document.addEventListener('keydown', event => {
        if (isGameInProgress && event.key === 'w') {
        leftPaddleY -= paddleSpeed;
        const data = {
            "PaddleY": leftPaddleY,
            "ballX": ballX,
            "ballY": ballY
        };
    }
    if (isGameInProgress && event.key === 's') {
        leftPaddleY += paddleSpeed;
        const data = {
            "PaddleY": leftPaddleY,
            "ballX": ballX,
            "ballY": ballY
        };
    }
    if (isGameInProgress && event.key === 'ArrowUp') {
        rightPaddleY -= paddleSpeed;
        const data = {
            "PaddleY": leftPaddleY,
            "ballX": ballX,
            "ballY": ballY
        };
    }
    if (isGameInProgress && event.key === 'ArrowDown') {
        rightPaddleY += paddleSpeed;
        const data = {
            "PaddleY": leftPaddleY,
            "ballX": ballX,
            "ballY": ballY
        };
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
    if (ballX <= paddleWidth / 2 && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX += 0.001;
    }
    if (ballX >= canvas.width - paddleWidth / 2 && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)
    {
        ballSpeedX = -ballSpeedX;
        ballSpeedX -= 0.001;
    }
}

function checkScore() {
        if (tournamentModeFlag && (ballX < 0 || ballX > canvas.width)) {
                if (ballX < 0) score2++; else score1++;
                document.getElementById("score1").textContent = score1;
                document.getElementById("score2").textContent = score2;
                if (score1 >= 1 || score2 >= 1) {
                        endMatch();
                } else {
                        startMatch();
                }
        } else if ((ballX < 0 || ballX > canvas.width)) {
                if (ballX < 0) score2++; else score1++;
                document.getElementById("score1").textContent = score1;
                document.getElementById("score2").textContent = score2;
                normalModeGamesPlayed++;
                if (normalModeGamesPlayed < 3 && Math.max(score1, score2) < 2) {
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
    if (tournamentModeFlag === 1) {
        for (let i = 1; i <= document.getElementById("numPlayers").value; i++) {
            document.getElementById(`player${i}`).value = "";
        }
        document.getElementById("numPlayers").value = "empty";
        document.getElementById("playerInputs").innerHTML = '';
        players = [];
    }
    currentMatchIndex = 0;
}

function resetToHomeScreen() {
        resetBall();
        resetGame();
        document.getElementById("pongCanvas").style.display = "block";
        document.getElementById("gameDashboard").style.display = "none";
        if (tournamentModeFlag === 1)
                document.getElementById("tournamentInfo").style.display = "none";
        document.getElementById("modeSelection").style.display = "block";
        tournamentModeFlag = 0;
}
