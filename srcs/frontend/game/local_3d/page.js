export function local3dPage() {
        return `<div id="modeSelection">
                        <h2>1 vs 1</h2>
                        <button id="3dMode" onClick="start3dMode()">Start</button>
                </div>
                <div id="gameDashboard" class="hidden">
                        <h2>Score</h2>
                        <p>Player 1: <span id="score1">0</span></p>
                        <p>Player 2: <span id="score2">0</span></p>
                </div>
                <script src="https://unpkg.com/three@0.108.0/build/three.module.js"></script>
                <script type="module" src="./pongLocal3d.js"></script>
                <canvas id="pong3dCanvas" width="800" height="400" style="background-color: black;"></canvas>`
};
