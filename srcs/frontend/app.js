import { routes } from "./routes.js";

var pongGameScriptTag = undefined;
var multiGameScriptTag = undefined;
var tournamentGameScriptTag = undefined;

const app = async () => {
        const pageMatch = routes.map(route => {
                return {
                        route: route,
                        isMatch: window.location.pathname === route.path,
                };
        });
        let match = pageMatch.find(page => page.isMatch);
        document.getElementById('app').innerHTML = match.route.template;

        // insert pong.js script inside HTML head on game page load
        if (match.route.path === '/local' && pongGameScriptTag === undefined)
        {
                pongGameScriptTag = document.createElement("script");
                pongGameScriptTag.src = "./game/local_pvp/pong.js";
                document.getElementsByTagName("head")[0].appendChild(pongGameScriptTag);
        }
        if (match.route.path === '/tournament' && tournamentGameScriptTag === undefined)
        {
                tournamentGameScriptTag = document.createElement("script");
                tournamentGameScriptTag.src = "./game/tournament/pong.js";
                document.getElementsByTagName("head")[0].appendChild(tournamentGameScriptTag);
        }
        if (match.route.path === '/multi' && multiGameScriptTag === undefined)
        {
                multiGameScriptTag = document.createElement("script");
                multiGameScriptTag.src = "./game/multi/ws.js";
                document.getElementsByTagName("head")[0].appendChild(multiGameScriptTag);
        }
}

// on user press forward
const navigate = url => {
        window.history.pushState({}, "", url);
        app();
};

// on user press back
document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('popstate', function (event) {
                // stop pong.js
                if (this.window.href === '/local')
                        resetToHomeScreen();
                app();
        });
        // prevent default behaviour for all HTML <a> tags
        // instead pass uri to SPA router
        document.body.addEventListener('click', event => {
                const target = event.target.closest('a');
                if (!(target instanceof HTMLAnchorElement))
                        return;
                event.preventDefault();
                navigate(target.href);
        });

        app();
});
