export function local3dPage() {
        return `<div id="modeSelection">
                        <h2>1 vs 1</h2>
                </div>
                <div id = "startButton">
                        <button id="3dMode">Start</button>
                </div>
                <div id="gameDashboard" class="hidden">
                        <h2>Score</h2>
                        <p>Player 1: <span id="score1">0</span></p>
                        <p>Player 2: <span id="score2">0</span></p>
                </div>
                <canvas id="pong3dCanvas" width="800" height="400" style="background-color: black; margin-bottom: 20px;"></canvas>
                <div id="lowerCanvases" style="display: flex; justify-content: center; gap: 20px;">
                        <canvas id="pong3dLeft" width="390" height="390" style="background-color: black;"></canvas>
                        <canvas id="pong3dRight" width="390" height="390" style="background-color: black;"></canvas>
                </div>`
                
};
