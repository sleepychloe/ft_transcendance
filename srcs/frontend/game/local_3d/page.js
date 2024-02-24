export function local3dPage() {
        // console.log("local_pvp/page.js : local 3d function called");
        return `<div id="modeSelection">
                        <h2>1 vs 1</h2>
                        <button id="normalMode" onClick="startNormalMode()">Start</button><button id="tournamentMode" class="hidden">Tournament Mode</button>
                </div>
                <div id="gameDashboard" class="hidden">
                        <h2>Score</h2>
                        <p>Player 1: <span id="score1">0</span></p>
                        <p>Player 2: <span id="score2">0</span></p>
                </div>
                <canvas id="pongCanvas" width="800" height="400" class="hidden"></canvas>`
};
