const router = new Router(routes);



document.addEventListener('DOMContentLoaded', function () {
        console.log("DOMContentLoader Event Listener Called");

        window.addEventListener('popstate', function (event) {
                console.log("popstate: ", window.location.pathname);
                router.routePage(window.location.pathname);
        });
});
