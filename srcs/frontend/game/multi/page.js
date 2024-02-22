export function multiPage() {
        // console.log("multi/page.js : multiPage function called");
        // return `<textarea id="chat-log" cols="100" rows="20"></textarea><br />
        //         <input id="chat-message-input" type="text" size="100"><br />
        //         <input id="chat-message-submit" type="text" size="100"><br />`
        // return `<canvas id="pongCanvas" width="800" height="600"></canvas>`;
        return `<div class="modal">
                        <div class="modal-content">
                                <input type="text" id="room-name-input" placeholder="Lobby Name" minlength="1" maxlength="16" required />
                                <button class="btn-modal-input-submit" onClick="multiCreateRoom()">Create</button>
                        </div>
                </div>
                <div class="overlay"></div>
                <div class="multi-room-choice-list">
                        <div class="multi-room-choice-list-item"><button class="btn-multi-room-select" onClick="modalShow()">Create Game</button></div>
                        <div class="multi-room-choice-list-item"><button class="btn-multi-room-select" onClick="multiListRoom()">Join Game</button></div>
                </div>`
};
