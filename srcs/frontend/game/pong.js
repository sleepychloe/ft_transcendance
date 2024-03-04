const translations = {
    en: {
        player: "Player",
        vs: "vs",
        alertPlayerNum: "3 to 6 players required !",
        alertPlayerName: "Player name should not consist of only numbers or be duplicates of other player names.\nPleas enter a different name: Player",
        alertTournamentWinner: "Tournament Winner",
        alertWinner: "Winner",
        waiting: "Waiting for players",
        next: "next opponent",
    },
    fr: {
        player: "Joueur",
        vs: "contre",
        alertPlayerNum: "De 3 à 6 joueurs requis !",
        alertPlayerName: "Le nom du joueur ne doit pas être composé uniquement de chiffres ou être un doublon d'un autre nom de joueur.\nVeuillez entrer un nom différent: le Joueur",
        alertTournamentWinner: "Vainqueur du tournoi",
        alertWinner: "Vainqueur",
        waiting: "En attente des joueurs",
        next: "prochain adversaire",
    },
    ko: {
        player: "플레이어",
        vs: "대",
        alertPlayerNum: "3명에서 6명의 플레이어가 필요합니다 !",
        alertPlayerName: "플레이어 이름은 숫자만으로 구성되어서는 안되며 다른 플레이어 이름과 중복되어서는 안됩니다.\n다른 이름을 입력해주세요: 플레이어",
        alertTournamentWinner: "토너먼트 우승자",
        alertWinner: "우승자",
        waiting: "플레이어를 기다리는 중",
        next: "다음 상대",
    },
};

export const t = translations[currentLanguage];

let game_data = {
    canvas: undefined,
    ctx: undefined,
    normalCount: 0,
    random: 0,
    leftPaddleY: 0,
    rightPaddleY: 0,
    paddleWidth: 0,
    paddleHeight: 0,
    paddleSpeed: 14,
    ballX: 0,
    ballY: 0,
    ballSpeedX: 0,
    ballSpeedY: 0,
    ballSize: 0,
    score1: 0,
    score2: 0,
    players: [],
    currentMatchIndex: 0,
    gameLoopId: 0,
    normalModeGamesPlayed: 0,
    isGameInProgress: false,
    tournamentModeFlag: 0,
    touchstartX: 0,
    touchstartY: 0,
    touchendY: 0,
};

let keyPress = {};

export function get_data() {
    return game_data;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function onWindowResize(game_data = {}) {
    let width, height;
    let proportion = 0.5;

    // mobile mode && rotated
    if (isMobileDevice() && window.innerWidth > window.innerHeight) {
        height = window.innerHeight - 4 - 47;
        if (window.innerHeight > 400) {
            height = 400 - 4;
        }
        width = height / proportion;
    } else { // web mode, mobile mode && not rotated
        width = window.innerWidth - 4;

        if (window.innerWidth > 800) {
            width = 800 - 4;
        }
        height = width * proportion;
    }

    let pongCanvas = document.getElementById('pongCanvas');
    if (pongCanvas) {
        pongCanvas.setAttribute('width', width);
        pongCanvas.setAttribute('height', height);
    }

    if (game_data['isGameInProgress'] === true) {
        game_data['paddleWidth'] = width / 80;
        game_data['paddleHeight'] = height / 4;
        game_data['ballSize'] = width / 80;
    }
}

export function canvasInit(game_data = {}) {
    let width, height;
    let proportion = 0.5;

    // mobile mode && rotated
    if (isMobileDevice() && window.innerWidth > window.innerHeight) {
        height = window.innerHeight - 4 - 47;
        if (window.innerHeight > 400) {
            width = 400 - 4;
        }
        width = height / proportion;
    } else { // web mode, mobile mode && not rotated
        width = window.innerWidth - 4;

        if (window.innerWidth > 800) {
            width = 800 - 4;
        }
        height = width * proportion;
    }

    let pongCanvas = document.getElementById('pongCanvas');
    pongCanvas.setAttribute('width', width);
    pongCanvas.setAttribute('height', height);

    game_data['canvas'] = document.getElementById("pongCanvas");
    game_data['ctx'] = document.getElementById("pongCanvas").getContext("2d");
    game_data['paddleWidth'] = game_data['canvas'].width / 80;
    game_data['paddleHeight'] = game_data['canvas'].height / 4;
    game_data['ballSize'] = game_data['canvas'].width / 80;
    game_data['leftPaddleY'] = game_data['canvas'].height / 2;
    game_data['rightPaddleY'] = game_data['canvas'].height / 2;
    game_data['ballX'] = game_data['canvas'].width / 2
    game_data['ballY'] = game_data['canvas'].height / 2;
}

export function resetBall(game_data = {}) {
    game_data['ballX'] = game_data['canvas'].width / 2;
    game_data['ballY'] = game_data['canvas'].height / 2;
    game_data['ballSpeedX'] = game_data['canvas'].width / 400 + game_data['canvas'].width / 540 * Math.random();
    game_data['ballSpeedY'] = game_data['canvas'].width / 400 + game_data['canvas'].width / 540 * Math.random();
    game_data['leftPaddleY'] = game_data['canvas'].height / 2;
    game_data['rightPaddleY'] = game_data['canvas'].height / 2;
    keyPress = {};
}

export function updatePaddlePosition(game_data = {}) {
    if (game_data['leftPaddleY'] < 0) game_data['leftPaddleY'] = 0;
    if (game_data['leftPaddleY'] + game_data['paddleHeight'] > game_data['canvas'].height) game_data['leftPaddleY'] = game_data['canvas'].height - game_data['paddleHeight'];
    if (game_data['rightPaddleY'] < 0) game_data['rightPaddleY'] = 0;
    if (game_data['rightPaddleY'] + game_data['paddleHeight'] > game_data['canvas'].height) game_data['rightPaddleY'] = game_data['canvas'].height - game_data['paddleHeight'];
}

export function paddleCollision(game_data = {}) {
    if (game_data['ballX'] <= game_data['paddleWidth'] / 2 && game_data['ballY'] > game_data['leftPaddleY'] && game_data['ballY'] < game_data['leftPaddleY'] + game_data['paddleHeight']) {
        game_data['ballSpeedX'] = -game_data['ballSpeedX'];
        game_data['ballSpeedX'] += 0.001;
    }
    if (game_data['ballX'] >= game_data['canvas'].width - game_data['paddleWidth'] / 2 && game_data['ballY'] > game_data['rightPaddleY'] && game_data['ballY'] < game_data['rightPaddleY'] + game_data['paddleHeight']) {
        game_data['ballSpeedX'] = -game_data['ballSpeedX'];
        game_data['ballSpeedX'] -= 0.001;
    }
}

export function checkScore(game_data = {}) {
    if (game_data['tournamentModeFlag'] && (game_data['ballX'] < 0 || game_data['ballX'] > game_data['canvas'].width)) {
        if (game_data['ballX'] < 0) game_data['score2']++; else game_data['score1']++;
        document.getElementById("score1").textContent = game_data['score1'];
        document.getElementById("score2").textContent = game_data['score2'];
        if (game_data['score1'] >= 1 || game_data['score2'] >= 1) {
            endMatch(game_data);
        } else {
            startMatch(game_data);
        }
    } else if ((game_data['ballX'] < 0 || game_data['ballX'] > game_data['canvas'].width)) {
        if (game_data['ballX'] < 0) game_data['score2']++; else game_data['score1']++;
        document.getElementById("score1").textContent = game_data['score1'];
        document.getElementById("score2").textContent = game_data['score2'];
        game_data['normalModeGamesPlayed']++;
        if (game_data['normalModeGamesPlayed'] < 3 && Math.max(game_data['score1'], game_data['score2']) < 2) {
            startMatch(game_data);
        } else {
            endNormalGame(game_data);
        }
    }
}

export function drawEverything(game_data) {
    game_data['ctx'].clearRect(0, 0, game_data['canvas'].width, game_data['canvas'].height);
    game_data['ctx'].fillStyle = 'white';
    game_data['ctx'].fillRect(0, game_data['leftPaddleY'], game_data['paddleWidth'], game_data['paddleHeight']);
    game_data['ctx'].fillRect(game_data['canvas'].width - game_data['paddleWidth'], game_data['rightPaddleY'], game_data['paddleWidth'], game_data['paddleHeight']);
    game_data['ctx'].beginPath();
    game_data['ctx'].arc(game_data['ballX'], game_data['ballY'], game_data['ballSize'], 0, Math.PI * 2, false);
    game_data['ctx'].fill();
}

export function startMatch(game_data = {}) {
    game_data['random']++;
    resetBall(game_data);
    if (game_data['tournamentModeFlag']) {
        document.getElementById("tournamentInfo").className = "flex-column justify-content-center d-flex";
    }
    if (!game_data['gameLoopId']) {
        game_data['isGameInProgress'] = true;
        game_data['gameLoopId'] = requestAnimationFrame(() => {
            gameLoop(game_data);
        });
    }
}

export function gameLoop(game_data = {}) {
    onWindowResize(game_data);
    if (!game_data['isGameInProgress']) {
        game_data['ctx'].clearRect(0, 0, game_data['canvas'].width, game_data['canvas'].height);
        return;
    }
    updatePaddlePosition(game_data);
    if (game_data['random'] % 2 !== 0) {
        game_data['ballX'] -= game_data['ballSpeedX'];
        game_data['ballY'] -= game_data['ballSpeedY'];
    }
    else {
        game_data['ballX'] += game_data['ballSpeedX'];
        game_data['ballY'] += game_data['ballSpeedY'];
    }
    if (game_data['ballY'] <= game_data['paddleWidth'] / 2 || game_data['ballY'] >= game_data['canvas'].height - game_data['paddleWidth'] / 2)
        game_data['ballSpeedY'] = -game_data['ballSpeedY'];
    paddleCollision(game_data);
    checkScore(game_data);
    drawEverything(game_data);
    game_data['gameLoopId'] = requestAnimationFrame(() => {
        gameLoop(game_data);
    });
}

export function resetGame(game_data = {}) {
    keyPress = {};
    game_data['isGameInProgress'] = false;
    if (game_data['gameLoopId']) {
        cancelAnimationFrame(game_data['gameLoopId']);
        game_data['gameLoopId'] = null;
    }
    game_data['gameLoopId'] = null;
    game_data['score1'] = 0;
    game_data['score2'] = 0;
    let score1 = document.getElementById("score1");
    let score2 = document.getElementById("score2");
    if (score1 && score2) {
        score1.textContent = game_data['score1'];
        score2.textContent = game_data['score2'];
    }
    if (game_data['tournamentModeFlag'] === 1) {
        const numPlayersElement = document.getElementById("numPlayers");
        if (numPlayersElement) {
            for (let i = 1; i <= numPlayersElement.value; i++) {
                const playerElement = document.getElementById(`player${i}`);
                if (playerElement) {
                    playerElement.value = "";
                }
            }
            numPlayersElement.value = "";
        }
        const playerInputsContainer = document.getElementById("playerInputsContainer");
        if (playerInputsContainer) {
            playerInputsContainer.innerHTML = '';
        }
        game_data['players'] = [];
    }
    game_data['currentMatchIndex'] = 0;
    let pc = document.getElementById("pongCanvas");
    if (pc)
        pc.className = "d-none";
    document.removeEventListener('keydown', movePaddle);
    document.removeEventListener('keyup', stopPaddle);
    document.removeEventListener('touchstart', touchStartPaddle);
    document.removeEventListener('touchend', touchEndPaddle);
}

export function resetToHomeScreen(game_data) {
    resetBall(game_data);
    resetGame(game_data);
    document.getElementById("gameDashboard").className = "flex-column justify-content-center d-none";
    if (game_data['tournamentModeFlag'] === 1)
        document.getElementById("tournamentInfo").className = "flex-column justify-content-center d-none";
    game_data['tournamentModeFlag'] = 0;
}

export function endMatch() {
    let winner = game_data['score1'] > game_data['score2'] ? game_data['players'][0] : game_data['players'][1];

    keyPress = {};
    game_data['players'].push(winner);
    game_data['players'].splice(0, 2);

    if (game_data['players'].length > 1) {
        displayMatchups();
        startMatch(game_data);
    } else {
        if (game_data['isGameInProgress'] === true) {
            alert(`${t.alertTournamentWinner}: ${winner}`);
            game_data['isGameInProgress'] = false;
            if (game_data['gameLoopId']) {
                cancelAnimationFrame(game_data['gameLoopId']);
                game_data['gameLoopId'] = null;
            }
            resetToHomeScreen(game_data);
            document.removeEventListener('keydown', movePaddle);
            document.removeEventListener('keyup', stopPaddle);
            document.removeEventListener('touchstart', touchStartPaddle);
            document.removeEventListener('touchend', touchEndPaddle);
            let btnStart = document.getElementById('tournamentMode');
            btnStart.removeAttribute('disabled');
        }
    }
}

export function displayMatchups() {
    const currentMatchDisplay = document.getElementById("currentMatch");
    const upcomingMatchesDisplay = document.getElementById("upcomingMatches");

    if (game_data['players'].length >= 2) {
        currentMatchDisplay.textContent = `${game_data['players'][0]} ${t.vs} ${game_data['players'][1]}`;
    } else {
        currentMatchDisplay.textContent = `${t.waiting}`;
    }
    upcomingMatchesDisplay.innerHTML = '';
    for (let i = 2; i < game_data['players'].length; i++) {
        const matchInfo = document.createElement("div");
        matchInfo.textContent = `${game_data['players'][i]} (${t.next})`;
        upcomingMatchesDisplay.appendChild(matchInfo);
    }
}

export function endNormalGame(game_data = {}) {
    keyPress = {};
    if (game_data['isGameInProgress']) {
        let winner = game_data['score1'] > game_data['score2'] ? `${t.player}` + ' 1' : `${t.player}` + ' 2';

        game_data['isGameInProgress'] = false;
        if (game_data['gameLoopId']) {
            cancelAnimationFrame(game_data['gameLoopId']);
            game_data['gameLoopId'] = null;
        }
        alert(`${t.alertWinner}: ${winner}`);
        game_data['normalCount']++;
        resetToHomeScreen(game_data);
    }
    document.removeEventListener('keydown', movePaddle);
    document.removeEventListener('keyup', stopPaddle);
    document.removeEventListener('touchstart', touchStartPaddle);
    document.removeEventListener('touchend', touchEndPaddle);

    let btnStart = document.getElementById('normalMode');
    btnStart.removeAttribute('disabled');
}

export const touchStartPaddle = (e) => {
    console.log('touchStartPaddle fired');
    game_data['touchstartX'] = e.changedTouches[0].screenX;
    game_data['touchstartY'] = e.changedTouches[0].screenY;
}

export const touchEndPaddle = (e) => {
    console.log('touchEndPaddle fired');
    game_data['touchendY'] = e.changedTouches[0].screenY;
    console.log('touchstartX: ', game_data['touchstartX'], ' screen.width: ', window.innerWidth);
    if (game_data['touchstartX'] > window.innerWidth / 2) {
        if (game_data['touchendY'] < game_data['touchstartY']) game_data['rightPaddleY'] -= game_data['paddleSpeed'];
        if (game_data['touchendY'] > game_data['touchstartY']) game_data['rightPaddleY'] += game_data['paddleSpeed'];
    } else if (game_data['touchstartX'] <= window.innerWidth / 2) {
        if (game_data['touchendY'] < game_data['touchstartY']) game_data['leftPaddleY'] -= game_data['paddleSpeed'];
        if (game_data['touchendY'] > game_data['touchstartY']) game_data['leftPaddleY'] += game_data['paddleSpeed'];
    }
}

export const movePaddle = async (e) => {
    keyPress[e.which] = true;

    if (keyPress[73]) {
        game_data['rightPaddleY'] -= game_data['paddleSpeed'];
    }
    if (keyPress[75]) {
        game_data['rightPaddleY'] += game_data['paddleSpeed'];
    }
    if (keyPress[87]) {
        game_data['leftPaddleY'] -= game_data['paddleSpeed'];
    }
    if (keyPress[83]) {
        game_data['leftPaddleY'] += game_data['paddleSpeed'];
    }
}

export const stopPaddle = async (e) => {
    keyPress[e.which] = false;
}
