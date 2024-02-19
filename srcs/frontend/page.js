export function indexPage() {
        console.log("page.js : indexPage function called");
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
                        <main class="main-part"></main>
                        <footer></footer>
                </div>`
};
