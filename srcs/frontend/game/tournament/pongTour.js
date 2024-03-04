import { canvasInit } from '/static/game/pong.js';
import { resetGame } from '/static/game/pong.js';
import { startMatch } from '/static/game/pong.js';
import { displayMatchups } from '/static/game/pong.js';
import { get_data } from '/static/game/pong.js';
import { t } from '/static/game/pong.js';
import { movePaddle } from '/static/game/pong.js';
import { stopPaddle } from '/static/game/pong.js';
import { touchStartPaddle } from '/static/game/pong.js';
import { touchEndPaddle } from '/static/game/pong.js';

let game_data = get_data();

export function startTournamentMode() {
    let btnStart = document.getElementById('tournamentMode');
    btnStart.setAttribute('disabled', true);
    document.getElementById("registration").className = "flex-column justify-content-center d-flex";
    game_data['tournamentModeFlag'] = 1;
    canvasInit(game_data);
    resetGame(game_data);
}

export function createPlayerInputs() {
    const numPlayers = parseInt(document.getElementById("numPlayers").value);
    const playerInputs = document.getElementById("playerInputsContainer");
    playerInputs.innerHTML = '';
    if (3 <= numPlayers && numPlayers <= 6 ) {
        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement("input");
            input.className = "form-control m-auto w-25";
            input.type = "text";
            input.placeholder = `${t.player} ${i}`;
            input.id = `player${i}`;
            playerInputs.appendChild(input);
        }
        document.getElementById("registerPlayersButton").className = "btn btn-success m-auto d-flex";
    }
    else {
        alert(`${t.alertPlayerNum}`);
        document.getElementById("registerPlayersButton").className = "btn btn-success m-auto d-none";
    }
}

export function registerPlayers() {
    if (!game_data['isGameInProgress']) {
        const numPlayers = parseInt(document.getElementById("numPlayers").value);
        game_data['players'] = [];
        let usedNames = new Set();
        for (let i = 1; i <= numPlayers; i++) {
            let playerName = document.getElementById(`player${i}`).value.trim();
            if (!playerName) {
                playerName = `${t.player}` + " " + i.toString();
            }
            while (usedNames.has(playerName) || /^\d+$/.test(playerName)) {
                let newName = prompt(`${t.alertPlayerName} ${i}:`);
                if (newName === null) {
                    playerName = `${t.player} ${i}`;
                    break;
                } else {
                    newName = newName.trim();
                    if (!newName) {
                        newName = `${t.player} ${i}`;
                    }
                playerName = newName;
                }
            }
            usedNames.add(playerName);
            game_data['players'].push(playerName);
        }
        usedNames = null;
        if (game_data['players'].length % 2 !== 0) {
            game_data['players'].push(game_data['players'].shift());
        }
        game_data['currentMatchIndex'] = 0;
        displayMatchups();
        document.getElementById("registerPlayersButton").className = "btn btn-success m-auto d-none";
        document.getElementById("registration").className = "flex-column justify-content-center d-none";
        document.getElementById("pongCanvas").className = "d-flex";
        document.addEventListener('keydown', movePaddle);
        document.addEventListener('keyup', stopPaddle);
        document.addEventListener('touchstart', touchStartPaddle);
        document.addEventListener('touchend', touchEndPaddle);
        startMatch(game_data);
        game_data['isGameInProgress'] = true;
    }
}
