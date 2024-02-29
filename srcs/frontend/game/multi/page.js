const translations = {
        en: {
            lobbyName: "Lobby Name",
            create: "Create",
            createGame: "Create Game",
            joinGame: "Join Game",
        },
        fr: {
            lobbyName: "Nom du lobby",
            create: "Créer",
            createGame: "Créer une partie",
            joinGame: "Rejoindre une partie",
        },
        ko: {
            lobbyName: "로비 이름",
            create: "생성하기",
            createGame: "게임 생성",
            joinGame: "게임 참가",
        },
    };

export function multiPage() {
        const t = translations[currentLanguage];
        return `<div class="modal">
                        <div class="modal-content">
                                <input type="text" id="room-name-input" placeholder="${t.lobbyName}" minlength="1" maxlength="16" required />
                                <button class="btn-modal-input-submit" onClick="multiCreateRoom()">${t.create}</button>
                        </div>
                </div>
                <div class="overlay"></div>
                <div class="multi-room-choice-list">
                        <div class="multi-room-choice-list-item"><button class="btn-multi-room-select" onClick="modalShow()">${t.createGame}</button></div>
                        <div class="multi-room-choice-list-item"><button class="btn-multi-room-select" onClick="multiListRoom()">${t.joinGame}</button></div>
                </div>`
};
