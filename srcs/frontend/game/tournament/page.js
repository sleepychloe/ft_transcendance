const translations = {
        en: {
            tournament: "Tournament",
            start: "Start",
            tournamentRegistration: "Tournament Registration",
            numberOfPlayers: "Number of Players",
            setPlayers: "Set Players",
            registerPlayers: "Register Players",
            currentMatch: "Current Match",
            upcomingMatches: "Upcoming Matches",
        },
        fr: {
            tournament: "Tournoi",
            start: "Commencer",
            tournamentRegistration: "Inscription au Tournoi",
            numberOfPlayers: "Nombre de Joueurs",
            setPlayers: "Définir les Joueurs",
            registerPlayers: "Inscrire les Joueurs",
            currentMatch: "Match Actuel",
            upcomingMatches: "Prochains Matchs",
        },
        ko: {
            tournament: "토너먼트",
            start: "시작",
            tournamentRegistration: "토너먼트 등록",
            numberOfPlayers: "플레이어 수",
            setPlayers: "플레이어 설정",
            registerPlayers: "플레이어 등록",
            currentMatch: "현재 경기",
            upcomingMatches: "다음 경기",
        },
    };

export function tournamentPage() {
        const t = translations[currentLanguage];
        return `<div class="d-flex flex-column justify-content-center">
                        <div class="flex-column justify-content-center d-none" id="registration">
                                <h2 class="d-flex m-auto">${t.tournamentRegistration}</h2>
                                <input class="form-control m-auto w-25" type="number" id="numPlayers" placeholder="${t.numberOfPlayers}">
                                <button class="btn btn-success m-auto" id="playerInputs">${t.setPlayers}</button>
                                <div id="playerInputsContainer"></div>
                                <button class="btn btn-success m-auto d-none" id="registerPlayersButton">${t.registerPlayers}</button>
                        </div>
                        <div class="flex-column justify-content-center d-none" id="gameDashboard">
                                <h2 class="d-flex m-auto">${t.score}</h2>
                                <p class="d-flex m-auto">${t.player1}: <span id="score1">0</span></p>
                                <p class="d-flex m-auto">${t.player2}: <span id="score2">0</span></p>
                        </div>
                        <div class="flex-column justify-content-center d-none" id="tournamentInfo">
                                <h2 class="d-flex m-auto">${t.currentMatch}</h2>
                                <p class="d-flex m-auto" id="currentMatch"></p>
                                <h3 class="d-flex m-auto">${t.upcomingMatches}</h3>
                                <ul class="d-flex flex-column justify-content-center m-auto p-0" id="upcomingMatches"></ul>
                        </div>
                        <button class="d-flex justify-content-center btn btn-sm btn-outline-success mt-2 p-2 px-3 m-auto" id="tournamentMode">${t.start}</button>
                        <canvas class="d-none" id="pongCanvas"></canvas>
                </div>`
};

