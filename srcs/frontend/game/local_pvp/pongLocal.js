import { canvasInit } from '/static/game/pong.js';
import { resetGame } from '/static/game/pong.js';
import { startMatch } from '/static/game/pong.js';
import { get_data } from '/static/game/pong.js';
import { movePaddle } from '/static/game/pong.js';
import { stopPaddle } from '/static/game/pong.js';

let game_data = get_data();

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function startNormalMode() {
    let btnStart = document.getElementById('normalMode');
    btnStart.setAttribute('disabled', true);
    game_data['tournamentModeFlag'] = 0;
    canvasInit(game_data);
    resetGame(game_data);
    game_data['normalModeGamesPlayed'] = 0;
    document.getElementById('gameDashboard').className = "d-flex flex-column justify-content-center m-auto";
    if (isMobileDevice()) {
        document.getElementById("pongCanvas").className = "d-flex";
    }
    document.addEventListener('keydown', movePaddle);
    document.addEventListener('keyup', stopPaddle);
    startMatch(game_data);
}
