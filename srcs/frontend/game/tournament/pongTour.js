function startTournamentMode() {
    canvasInit();
    resetGame();
    tournamentModeFlag = 1;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("registration").style.display = "block";
}

function createPlayerInputs() {
    const numPlayers = parseInt(document.getElementById("numPlayers").value);
    const playerInputs = document.getElementById("playerInputs");
    playerInputs.innerHTML = '';
    if (numPlayers >= 3) {
        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `${t.player} ${i}`;
            input.id = `player${i}`;
            playerInputs.appendChild(input);
        }
        document.getElementById("registerPlayersButton").classList.remove("hidden");
    }
    else {
        alert(`${t.alartPlayerNum}`);
        document.getElementById("registerPlayersButton").classList.add("hidden");
    }
}

function registerPlayers() {
    if (!isGameInProgress) {
        const numPlayers = parseInt(document.getElementById("numPlayers").value);
        players = [];
        let usedNames = new Set();
        for (let i = 1; i <= numPlayers; i++) {
            let playerName = document.getElementById(`player${i}`).value.trim();
            if (!playerName) {
                playerName = `${t.player}`+ " " + i.toString();
            }
            while (usedNames.has(playerName) || /^\d+$/.test(playerName)) {
                playerName = prompt(`Please enter a new name for Player ${i}:`).trim();
                if (!playerName) {
                    playerName = `${t.player}`+ " " + i.toString();
                }
            }
            usedNames.add(playerName);
            players.push(playerName);
        }
        delete usedNames;
        if (players.length % 2 !== 0) {
            players.push(players.shift());
        }
        currentMatchIndex = 0;
        displayMatchups();
        document.getElementById("registerPlayersButton").classList.add("hidden");
        document.getElementById("registration").style.display = "none";
        startMatch();
        isGameInProgress = true;
    }
}

function endMatch() {
    let winner = score1 > score2 ? players[0] : players[1];

    players.push(winner);
    players.splice(0, 2);

    if (players.length > 1) {
        displayMatchups();
        startMatch();
    } else {
        if (isGameInProgress === true) {
            alert(`${t.alertTournamentWinner}: ${winner}`);
            isGameInProgress = false;
            if (gameLoopId) {
                cancelAnimationFrame(gameLoopId);
                gameLoopId = null;
            }
            resetToHomeScreen();
        }
    }
}

function displayMatchups() {
    const currentMatchDisplay = document.getElementById("currentMatch");
    const upcomingMatchesDisplay = document.getElementById("upcomingMatches");

    if (players.length >= 2) {
        currentMatchDisplay.textContent = `${players[0]} ${t.vs} ${players[1]}`;
    } else {
        currentMatchDisplay.textContent = `${t.waiting}`;
    }
    upcomingMatchesDisplay.innerHTML = '';
    for (let i = 2; i < players.length; i++) {
        const matchInfo = document.createElement("div");
        matchInfo.textContent = `${players[i]} (${t.next})`;
        upcomingMatchesDisplay.appendChild(matchInfo);
    }
}
