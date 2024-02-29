import { canvasInit } from '/static/game/pong.js';
import { resetGame } from '/static/game/pong.js';
import { startMatch } from '/static/game/pong.js';
import { get_data } from '/static/game/pong.js';
import { movePaddle } from '/static/game/pong.js';

let game_data = get_data();

export function startNormalMode() {
    canvasInit(game_data);
    resetGame(game_data);
    game_data['normalModeGamesPlayed'] = 0;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("gameDashboard").style.display = "block";
    document.getElementById("pongCanvas").style.display = "block";
    document.addEventListener('keydown', movePaddle);
    startMatch(game_data);
}
