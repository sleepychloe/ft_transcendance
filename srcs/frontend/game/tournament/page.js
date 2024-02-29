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
        return `<div id="modeSelection">
                        <h2>${t.tournament}</h2>
                        <button id="tournamentMode">${t.start}</button>
                </div>
                <div id="registration" class="hidden">
                        <h2>${t.tournamentRegistration}</h2>
                        <input type="number" id="numPlayers" placeholder="${t.numberOfPlayers}">
                        <button id="playerInputs">${t.setPlayers}</button>
                        <div id="playerInputs"></div>
                        <button class="hidden" id="registerPlayersButton">${t.registerPlayers}</button>
                </div>
                <div id="gameDashboard" class="hidden">
                        <h2>${t.score}</h2>
                        <p>${t.player1}: <span id="score1">0</span></p>
                        <p>${t.player2}: <span id="score2">0</span></p>
                </div>
                <div id="tournamentInfo" class="hidden">
                        <h2>${t.currentMatch}</h2>
                        <p id="currentMatch"></p>
                        <h3>${t.upcomingMatches}</h3>
                        <ul id="upcomingMatches"></ul>
                </div>
                <canvas id="pongCanvas" width="800" height="400" class="hidden"></canvas>`
};
