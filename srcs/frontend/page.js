export function indexPage() {
        console.log("page.js : indexPage function called");
        return `
                <div class="d-flex align-items-center justify-content-center" style="min-height: 100vh;">
                        <div class="text-center">
                                <div class="header-container">
                                        <h1>Welcome to our ft_transcendence</h1>
                                        <h4>Select your game mode :)</h4>
                                </div>
                                <div class="btn-group" role="group" aria-label="select game mode">
                                        <button type="button" class="btn btn-primary">
                                                <a href="local" style="text-decoration: none !important;" class="text-white">Local Mode</a>
                                        </button>
                                        <button type="button" class="btn btn-success">
                                                <a href="tournament" style="text-decoration: none !important;" class="text-white">Tournament Mode</a>
                                        </button>
                                        <button type="button" class="btn btn-warning">
                                                <a href="multi" style="text-decoration: none !important;" class="text-white">Multi Mode</a>
                                        </button>
                                </div>
                        </div>
                </div>`
};
