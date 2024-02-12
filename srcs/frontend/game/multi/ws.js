let roomName = "12345";

let chatSocket = new WebSocket(
	`wss://${window.location.host}/ws/`
);

chatSocket.onmessage = (e) => {
	let data = JSON.parse(e.data);
	let message = data['message'];
	document.querySelector("#chat-log").value += (message + '\n');
};

chatSocket.onclose = (e) => {
	console.error('Chat socket closed unexpectedly');
};

document.querySelector("#chat-message-input").focus();
document.querySelector("#chat-message-input").addEventListener("keyup", (e) => {
	if (e.keyCode === 13) {
		document.querySelector("#chat-message-submit").click();
	}
});

document.querySelector("#chat-message-submit").addEventListener("click", (e) => {
	let messageInputDom = document.querySelector("#chat-message-input");
	let message = messageInputDom.value;
	chatSocket.send(JSON.stringify({
		'message': message
	}));

	messageInputDom.value = '';
});