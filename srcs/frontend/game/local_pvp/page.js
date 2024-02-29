const translations = {
        en: {
            vs: "1 vs 1",
            start: "Start",
            score: "Score",
            player1: "Player 1",
            player2: "Player 2",
        },
        fr: {
            vs: "1 contre 1",
            start: "Commencer",
            score: "Score",
            player1: "Joueur 1",
            player2: "Joueur 2",
        },
        ko: {
            vs: "1 대 1",
            start: "시작",
            score: "점수",
            player1: "플레이어 1",
            player2: "플레이어 2",
        },
    };

export function localpvpPage() {
        const t = translations[currentLanguage];
        return `<div id="modeSelection">
                        <h2>${t.vs}</h2>
                        <button id="normalMode">${t.start}</button>
                </div>
                <div id="gameDashboard" class="hidden">
                        <h2>${t.score}</h2>
                        <p>${t.player1}: <span id="score1">0</span></p>
                        <p>${t.player2}: <span id="score2">0</span></p>
                </div>
                <canvas id="pongCanvas" width="800" height="400" class="hidden"></canvas>`
};
