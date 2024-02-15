import { routes } from "./routes.js";

const app = async () => {
        const pageMatch = routes.map(route => {
                return {
                        route: route,
                        isMatch: window.location.pathname === route.path,
                };
        });
        let match = pageMatch.find(page => page.isMatch);
        document.getElementById('app').innerHTML = match.route.template;
        let scriptTag = match.route.script;

        // insert corresponding script inside HTML head on page load
        if (scriptTag !== null)
                document.getElementsByTagName("head")[0].appendChild(scriptTag);
        else
                console.log("script for ", match.route.path, " is already loaded");
        
        // insert pong.js script inside HTML head on game page load
        if (match.route.path !== '/' && !document.getElementById('script-path-./game/pong.js'))
        {
                var tag = document.createElement("script");
                tag.src = "./game/pong.js";
                tag.id = "script-path-./game/pong.js";
                document.getElementsByTagName("head")[0].appendChild(tag);
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
                if (window.location.pathname === '/')
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
