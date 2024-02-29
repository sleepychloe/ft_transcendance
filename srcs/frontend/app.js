import { routes } from '/static/routes.js';
import { initLogo } from '/static/3d.js';
import { start3dMode, stopAnimation } from '/static/game/local_3d/pongLocal3d.js';
import { startNormalMode } from '/static/game/local_pvp/pongLocal.js';
import { startTournamentMode } from '/static/game/tournament/pongTour.js';
import { createPlayerInputs } from '/static/game/tournament/pongTour.js';
import { registerPlayers } from '/static/game/tournament/pongTour.js';
import { multiCreateRoom, modalShow, multiListRoom } from '/static/game/multi/pongMulti.js';
import { resetGame } from '/static/game/pong.js';
import { get_data } from '/static/game/pong.js';
import { disconnectGame, multiFinishGame } from '/static/game/multi/pongMulti.js';

let game_data = get_data();

const app = async () => {
        const pageMatch = routes.map(route => {
                return {
                        route: route,
                        isMatch: window.location.pathname === route.path,
                };
        });
        let match = pageMatch.find(page => page.isMatch);
        document.getElementById('app').innerHTML = match.route.template;
        document.getElementsByClassName('main-title')[0].innerHTML = match.route.name;
        var languageSelection = document.querySelector('.language-selection');
        languageSelection.style.display = 'none';
        if (match.route.path === '/') {
                languageSelection.style.display = 'block';
                requestAnimationFrame(() => {
                        initLogo();
                });
        } else if (match.route.path === '/local') {
                document.getElementById('normalMode').addEventListener('click', startNormalMode);
        } else if (match.route.path === '/local_3d') {
                start3dMode();
        } else if (match.route.path === '/tournament') {
                document.getElementById('tournamentMode').addEventListener('click', startTournamentMode);
                document.getElementById('playerInputs').addEventListener('click', createPlayerInputs);
                document.getElementById('registerPlayersButton').addEventListener('click', registerPlayers);
        } else if (match.route.path === '/multi') {
                document.getElementById('btn-modal-input-submit').addEventListener('click', multiCreateRoom);
                document.getElementById('btn-create-room').addEventListener('click', modalShow);
                document.getElementById('btn-join-room').addEventListener('click', multiListRoom);
        }
}

let oldUrl;
let history = [];

function gc(url="") {
        if (url === '/') {
                // do nothing
        } else if (url === '/local') {
                console.log('reset game for local');
                resetGame(game_data);
        } else if (url === '/local_3d') {
                console.log('reset game for local 3d');
                stopAnimation();
        } else if (url === '/tournament') {
                console.log('reset game for tournament');
                resetGame(game_data);
        } else if (url === '/multi') {
                console.log('reset game for multi');
                multiFinishGame();
                disconnectGame();
        }
}

const navigate = url => {
        gc(oldUrl);
        window.history.pushState({}, "", url);
        app();
};

document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('popstate', function (event) {
                gc(history[history.length - 1]);
                history.pop();
                app();
        });
        // prevent default behaviour for all HTML <a> tags
        // instead pass uri to SPA router
        document.body.addEventListener('click', event => {
                const target = event.target.closest('a');
                if (!(target instanceof HTMLAnchorElement))
                        return;
                event.preventDefault();
                if (window.location.href != target.href) {
                        oldUrl = window.location.pathname
                        history.push(target.pathname);
                        navigate(target.href);
                }
        });

        app();
});

