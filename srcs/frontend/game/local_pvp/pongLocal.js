function startNormalMode() {
    canvasInit();
    resetGame();
    normalModeGamesPlayed = 0;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("gameDashboard").style.display = "block";
    document.getElementById("pongCanvas").style.display = "block";
    startMatch();
}

function endNormalGame() {
    if (isGameInProgress) {
        let winner = score1 > score2 ? 'Player 1' : 'Player 2';

        isGameInProgress = false;
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        alert(`Winner: ${winner}`);
        normalCount++;
        resetToHomeScreen();
    }
}
