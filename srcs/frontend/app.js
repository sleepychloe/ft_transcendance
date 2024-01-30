const routes = [
        {
                path: '/',
                template: '<div class="d-flex align-items-center justify-content-center" style="min-height: 100vh;"><div class="text-center"><div class="header-container"><h1>Welcome to our ft_transcendence</h1><h4>Select your game mode :)</h4></div><div class="btn-group" role="group" aria-label="select game mode"><button type="button" class="btn btn-primary"><a href="/game" style="text-decoration: none !important;" class="text-white">Local Mode</a></button><button type="button" class="btn btn-success"><a href="/tournament" style="text-decoration: none !important;" class="text-white">Tournament Mode</a></button><button type="button" class="btn btn-warning"><a href="multi" style="text-decoration: none !important;" class="text-white">Multi Mode</a></button></div></div></div>'
        },
        {
                path: '/game',
                template: '<div id="modeSelection"><h2>1 vs 1</h2><button id="normalMode">Start</button><button id="tournamentMode"class="hidden">Tournament Mode</button><button id="aiMode" class="hidden">AI Mode</button></div><div id="registration" class="hidden"><h2>Tournament Registration</h2><input type="number" id="numPlayers"placeholder="Number of Players"><button onclick="createPlayerInputs()">Set Players</button><div id="playerInputs"></div><button onclick="registerPlayers()" class="hidden"id="registerPlayersButton">Register Players</button></div><div id="gameDashboard" class="hidden"><h2>Score</h2><p>Player 1: <span id="score1">0</span></p><p>Player 2: <span id="score2">0</span></p></div><div id="tournamentInfo" class="hidden"><h2>Current Match</h2><p id="currentMatch"></p><h3>Upcoming Matches</h3><ul id="upcomingMatches"></ul></div><canvas id="pongCanvas" width="800" height="400" class="hidden"></canvas>'
        },
        {
                path: '/tournament',
                template: '<h1>tournament</h1>'
        },
        {
                path: '/multi',
                template: '<h1>multi</h1>'
        },
];

const app = async () => {
        console.log("url: ", window.location.pathname);
        const pageMatch = routes.map(route => {
                return {
                        route: route,
                        isMatch: window.location.pathname === route.path,
                };
        });
        let match = pageMatch.find(page => page.isMatch);
        console.log("match.route.template: ", match.route.template);
        document.getElementById('app').innerHTML = match.route.template;
}

const navigate = url => {
        window.history.pushState({}, "", url);
        app();
};

document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('popstate', function (event) {
                console.log("popstate: ", event.target.href);
                app();
        });
        document.body.addEventListener('click', event => {
                const target = event.target.closest('a');
                if (!(target instanceof HTMLAnchorElement))
                        return;
                event.preventDefault();
                navigate(target.href);
        });

        app();
});
