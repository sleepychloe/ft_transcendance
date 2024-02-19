import { lobbyComponent } from './page.js'

function multiCreateRoom() {
        console.log('create room');
        // establish ws connection here

        document.getElementsByClassName('main-part')[0].innerHTML = lobbyComponent;
};

function multiJoinRoom() {
        console.log('join room');
};
