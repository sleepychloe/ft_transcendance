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
        return `<div class="d-flex flex-column justify-content-center">
                    <div class="d-none flex-column justify-content-center m-auto" id="gameDashboard">
                            <h3 style="d-flex justify-content-center lead m-auto">
                                <strong class="d-flex justify-content-center">${t.score}</strong>
                            </h3>
                            <div class="d-flex flex-row">
                                <p class="d-flex mx-2">${t.player1}:<span class="mx-2" id="score1">0</span></p>
                                <p class="d-flex mx-2">${t.player2}:<span class="mx-2" id="score2">0</span></p>
                            </div>
                    </div>
                    <button class="d-flex justify-content-center btn btn-sm btn-outline-success mt-2 p-2 px-3 m-auto" id="normalMode">${t.start}</button>
                    <canvas class="d-none" id="pongCanvas"></canvas>
                </div>`
};
