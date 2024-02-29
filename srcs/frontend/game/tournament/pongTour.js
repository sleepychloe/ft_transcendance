import { canvasInit } from '/static/game/pong.js';
import { resetGame } from '/static/game/pong.js';
import { startMatch } from '/static/game/pong.js';
import { resetToHomeScreen } from '/static/game/pong.js';
import { get_data } from '/static/game/pong.js';
import { t } from '/static/game/pong.js';

let game_data = get_data();

export function startTournamentMode() {
    document.addEventListener('keydown', event => {
    if (event.key === 'w') {
        game_data['leftPaddleY'] -= game_data['paddleSpeed'];
    }
    if (event.key === 's') {
        game_data['leftPaddleY'] += game_data['paddleSpeed'];
    }
    if (event.key === 'ArrowUp') {
        game_data['rightPaddleY'] -= game_data['paddleSpeed'];
    }
    if (event.key === 'ArrowDown') {
        game_data['rightPaddleY'] += game_data['paddleSpeed'];
    }
    });
    canvasInit(game_data);
    resetGame(game_data);
    game_data['tournamentModeFlag'] = 1;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("registration").style.display = "block";
}

function createPlayerInputs() {
    const numPlayers = parseInt(document.getElementById("numPlayers").value);
    const playerInputs = document.getElementById("playerInputs");
    playerInputs.innerHTML = '';
    if (3 <= numPlayers && numPlayers <= 6 ) {
        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `${t.player} ${i}`;
            input.id = `player${i}`;
            playerInputs.appendChild(input);
        }
        document.getElementById("registerPlayersButton").classList.remove("hidden");
    }
    else if (numPlayers > 6) {
        alert(`${t.alertPlayerNum}`);
        document.getElementById("registerPlayersButton").classList.add("hidden");
    }
    else {
        alert(`${t.alertPlayerNum}`);
        document.getElementById("registerPlayersButton").classList.add("hidden");
    }
}

function registerPlayers() {
    if (!game_data['isGameInProgress']) {
        const numPlayers = parseInt(document.getElementById("numPlayers").value);
        players = [];
        let usedNames = new Set();
        for (let i = 1; i <= numPlayers; i++) {
            let playerName = document.getElementById(`player${i}`).value.trim();
            if (!playerName) {
                playerName = `${t.player}`+ " " + i.toString();
            }
            while (usedNames.has(playerName) || /^\d+$/.test(playerName)) {
                playerName = prompt(`Please enter a new name for Player ${i}:`).trim();
                if (!playerName) {
                    playerName = `${t.player}`+ " " + i.toString();
                }
            }
            usedNames.add(playerName);
            players.push(playerName);
        }
        delete usedNames;
        if (players.length % 2 !== 0) {
            players.push(players.shift());
        }
        game_data['players'] = players;
        game_data['currentMatchIndex'] = 0;
        displayMatchups();
        document.getElementById("registerPlayersButton").classList.add("hidden");
        document.getElementById("registration").style.display = "none";
        startMatch(game_data);
        game_data['isGameInProgress'] = true;
    }
}

function endMatch() {
    let winner = game_data['score1'] > game_data['score2'] ? game_data['players'][0] : game_data['players'][1];

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
        }
    }
}

function displayMatchups() {
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
