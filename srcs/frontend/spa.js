document.addEventListener('DOMContentLoaded', function () {
        console.log("DOMContentLoader Event Listener Called");
        handleRoute(window.location.pathname);

        window.addEventListener('popstate', function (event) {
                console.log("popstate: ", window.location.pathname);
                handleRoute(window.location.pathname);
        });
});

function handleClick(event) {
        event.preventDefault();
        console.log("pushstate: ", event.target.href);
        window.history.pushState({}, "", event.target.href);
        handleRoute(window.location.pathname);
}

var cacheList = {};

async function handleRoute(route) {
        console.log("Current Route: ", route);
        switch (route) {
                case '/game/local_pvp/':
                        // if (cacheList.hasOwnProperty("local_pvp"))
                        // {
                        //         document.getElementsByTagName("html")[0].innerHTML = cacheList["local_pvp"];
                        //         break;
                        // }
                        console.log("local_pvp.html");
                        // const gameHTML = await fetch("/game/local_pvp/local_pvp.js").then((data) => data.text());
                        // cacheList["local_pvp"] = gameHTML;
                        // console.log("testing fetch data", gameHTML);
                        document.getElementsByTagName("html")[0].innerHTML = gamePage();
                        break;

                default:
                        if (cacheList.hasOwnProperty("main"))
                        {
                                document.getElementsByTagName("html")[0].innerHTML = cacheList["main"];
                                break;
                        }
                        console.log("default page");
                        const mainHTML = await fetch("/index.html").then((data) => data.text());
                        cacheList["main"] = mainHTML;
                        // console.log("testing fetch data", mainHTML);
                        document.getElementsByTagName("html")[0].innerHTML = mainHTML;
        }
}

