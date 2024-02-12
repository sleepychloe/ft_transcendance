import { routes } from "./routes.js";

var pongGameScriptTag = undefined;

const app = async () => {
        const pageMatch = routes.map(route => {
                return {
                        route: route,
                        isMatch: window.location.pathname === route.path,
                };
        });
        let match = pageMatch.find(page => page.isMatch);
        document.getElementById('app').innerHTML = match.route.template;
        if (match.route.path === '/game' && pongGameScriptTag === undefined)
        {
                pongGameScriptTag = document.createElement("script");
                pongGameScriptTag.src = "./game/pong.js";
                document.getElementsByTagName("head")[0].appendChild(pongGameScriptTag);
        }
}

const navigate = url => {
        window.history.pushState({}, "", url);
        app();
};

document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('popstate', function (event) {
                resetToHomeScreen();
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
