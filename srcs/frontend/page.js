export function indexPage() {
        // console.log("page.js : indexPage function called");
        return `<div class="grid">
                        <header>
                                <div class="main-title">Welcome to Transcendence</div>
                        </header>
                        <nav class="navbar">
                                <div class="navbar-list">
                                        <a href="/" class="navbar-list-item">Home</a>
                                        <a href="/local" class="navbar-list-item">Local</a>
                                        <a href="/tournament" class="navbar-list-item">Tournament</a>
                                        <a href="/multi" class="navbar-list-item">Multi</a>
                                </div>
                        </nav>
                        <main class="main-part">
                                <div class="img-home"><img class="img-fun" src="https://devm33.com/c1ef06d75ea8b8fd150c7a9022e76ef4/pong.gif" /></div>
                        </main>
                        <footer></footer>
                </div>`
};
