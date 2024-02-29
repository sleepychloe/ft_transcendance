import { canvasInit } from '/static/game/pong.js';
import { resetGame } from '/static/game/pong.js';
import { startMatch } from '/static/game/pong.js';
import { resetToHomeScreen } from '/static/game/pong.js';
import { get_data } from '/static/game/pong.js'
import { t } from '/static/game/pong.js'

export function startNormalMode() {
    let game_data = get_data();
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
    game_data['normalModeGamesPlayed'] = 0;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("gameDashboard").style.display = "block";
    document.getElementById("pongCanvas").style.display = "block";
    startMatch(game_data);
}

export function endNormalGame(game_data={}) {
    if (game_data['isGameInProgress']) {
        let winner = game_data['score1'] > game_data['score2'] ? `${t.player}` + ' 1' : `${t.player}` + ' 2' ;

        game_data['isGameInProgress'] = false;
        if (game_data['gameLoopId']) {
            cancelAnimationFrame(game_data['gameLoopId']);
            game_data['gameLoopId'] = null;
        }
        alert(`${t.alertWinner}: ${winner}`);
        game_data['normalCount']++;
        resetToHomeScreen(game_data);
    }
}
