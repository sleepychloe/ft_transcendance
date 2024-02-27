import { routes } from "./routes.js";
import { initLogo, start3dMode, stopAnimation } from "./3d.js";

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
        let scriptTag = match.route.script;
        if (scriptTag !== null)
                document.getElementsByTagName("head")[0].appendChild(scriptTag);
        
        // insert pong.js script inside HTML head on game page load
        if ((match.route.path !== '/'
                && match.route.path !== '/multi'
                && match.route.path !== '/local_3d') && !document.getElementById('script-path-./game/pong.js'))
        {
                var tag = document.createElement("script");
                tag.src = "/static/game/pong.js";
                tag.id = "script-path-./game/pong.js";
                document.getElementsByTagName("head")[0].appendChild(tag);
        }
        if (match.route.path === '/') {
                // Ensure the DOM update has been processed
                requestAnimationFrame(() => {
                        initLogo();
                });
        }
        if (match.route.path === '/local_3d')
        {
                start3dMode();
        }
}

// on user press forward
const navigate = url => {
        if (window.location.pathname === '/local_3d') {
                stopAnimation();
        }
        if (window.location.pathname === '/local' || window.location.pathname === '/tournament') {
                if (gameLoopId) {
                        cancelAnimationFrame(gameLoopId);
                        gameLoopId = 0;
                }
        }
        window.history.pushState({}, "", url);
        app();
};

// on user press back
document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('popstate', function (event) {
                // stop pong.js
                // will try to find another way to avoid try catch block
                // if (window.location.pathname === '/')
                try {
                        resetToHomeScreen();
                } catch {
                        console.log("Failed to Reset the Game (game was not loaded)");
                }
                // stop multi page
                //
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

