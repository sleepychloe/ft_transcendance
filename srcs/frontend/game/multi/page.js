const translations = {
        en: {
            lobbyName: "Lobby Name",
            create: "Create",
            createGame: "Create Game",
            joinGame: "Join Game",
            modalTitle: "Creating Room...",
            modalClose: "Close",
        },
        fr: {
            lobbyName: "Nom du lobby",
            create: "Créer",
            createGame: "Créer une partie",
            joinGame: "Rejoindre une partie",
            modalTitle: "Créer une partie...",
            modalClose: "Ferme",
        },
        ko: {
            lobbyName: "로비 이름",
            create: "생성하기",
            createGame: "게임 생성",
            joinGame: "게임 참가",
            modalTitle: "방 만드는 중...",
            modalClose: "닫기",
        },
    };

export function multiPage() {
        const t = translations[currentLanguage];
        return `<div class="modal fade" id="createRoomModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">${t.modalTitle}</h5>
                            </div>
                            <div class="modal-body">
                                <input class="d-flex input-group-text m-auto w-100" type="text" id="room-name-input" placeholder="${t.lobbyName}" minlength="1" maxlength="16" required />
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${t.modalClose}</button>
                                <button type="button" class="btn btn-primary" id="btn-modal-input-submit" data-bs-dismiss="modal">${t.create}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex flex-column justify-content-center">
                        <div class="d-flex justify-content-center p-2"><button class="btn btn-outline-success p-3 mx-0 w-100" data-bs-toggle="modal" data-bs-target="#createRoomModal" id="btn-create-room">${t.createGame}</button></div>
                        <div class="d-flex justify-content-center p-2"><button class="btn btn-outline-success p-3 mx-0 w-100" id="btn-join-room">${t.joinGame}</button></div>
                </div>`
};
