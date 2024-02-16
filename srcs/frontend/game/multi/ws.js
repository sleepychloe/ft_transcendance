// let roomName = "12345";

// let chatSocket = new WebSocket(
// 	`wss://${window.location.host}/ws/`
// );

// chatSocket.onmessage = (e) => {
// 	let data = JSON.parse(e.data);
// 	let message = data['message'];
// 	document.querySelector("#chat-log").value += (message + '\n');
// };

// chatSocket.onclose = (e) => {
// 	console.error('Chat socket closed unexpectedly');
// };

// document.querySelector("#chat-message-input").focus();
// document.querySelector("#chat-message-input").addEventListener("keyup", (e) => {
// 	if (e.keyCode === 13) {
// 		document.querySelector("#chat-message-submit").click();
// 	}
// });

// document.querySelector("#chat-message-submit").addEventListener("click", (e) => {
// 	let messageInputDom = document.querySelector("#chat-message-input");
// 	let message = messageInputDom.value;
// 	chatSocket.send(JSON.stringify({
// 		'message': message
// 	}));

// 	messageInputDom.value = '';
// });


// function sendMessage() {
// 	const message = { message: 'Hello from the client!' };
// 	if (gameSocket.readyState === WebSocket.OPEN) {
// 	    gameSocket.send(JSON.stringify(message));
// 	}
// 	console.log(`sent`);
//     }

//     // Example usage: Call sendMessage() based on some event, like a button click.
// document.addEventListener("keydown", (e) => {
//     if (e.key === "ArrowLeft" || e.key === "a") {
//        sendMessage();
//     }
//     // Consider adding "ArrowUp" or "ArrowDown" if your game logic requires it
// });

// gameSocket.onmessage = function(event) {
// 	console.log("Received message from server: ", event.data);
// 	let data = JSON.parse(event.data);
// 	console.log("Received data from server: ", data.message);  // Ensure this logs the echoed message.
//     };

let gameSocket = new WebSocket(
		`wss://${window.location.host}/ws/`
	);; // Declare gameSocket at the top for global access

connectWebSocket();

function connectWebSocket() {
    // Ensure WebSocket uses the correct protocol (wss for secure, ws for local development)
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    gameSocket = new WebSocket(`${protocol}${window.location.host}/ws/`);

    gameSocket.onopen = function(event) {
        console.log("WebSocket is open now.");
    };

    gameSocket.onmessage = function(event) {
	try {
	    let data = JSON.parse(event.data);
	    console.log("Parsed data:", data);
	    updateGameState(data);
	} catch (error) {
	    console.error("Error parsing JSON:", error);
	}
    };

    gameSocket.onerror = function(error) {
        console.error("WebSocket Error:", error);
    };

    gameSocket.onclose = function(event) {
        console.error("WebSocket is closed now. Code:", event.code, "Reason:", event.reason);
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
    };
}

// Initialize WebSocket connection
document.addEventListener('DOMContentLoaded', function() {
	if (document.getElementById('pongCanvas')) {
		console.log("Canvas is initialized.");
	    } else {
		console.log("Canvas is not found.");
	    }
	    connectWebSocket();
});

let paddleX = 0, paddleY = 300;

function updateGameState(data) {
	// if (data.ball) {
	// 	const canvas = document.getElementById('pongCanvas');
	// 	const ctx = canvas.getContext('2d');
	// 	const ball = data.data;
	
	// 	// Clear the canvas
	// 	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// 	ctx.fillStyle = 'white';
	// 	ctx.beginPath();
	// 	ctx.arc(data['ball']['x'], data['ball']['y'], ballSize, 0, Math.PI * 2, false);
	// 	// ctx.arc(data.type.ball['x'], data.type.ball['x'], ballSize, 0, Math.PI * 2, false);
	// 	ctx.fill();
	// }
	if (data.type === 'game_state') {
		const canvas = document.getElementById('pongCanvas');
		const ctx = canvas.getContext('2d');
		const ball = data.data.ball; // Correctly access the ball data
		const ballSize = 10; // Define ballSize if not already defined
	
		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	
		// Draw the ball
		ctx.fillStyle = 'white';
		ctx.beginPath();
		if (data.data.ball)
			ctx.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2, false);
		if (data.paddle)
		{
			paddleX = data.paddle.x;
			paddleY = data.paddle.y;
		}
		ctx.fillRect(paddleX, paddleY, 10, 100);
		ctx.fill();
	    }
    }

function sendPaddleMovement(direction) {
	if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
	    gameSocket.send(JSON.stringify({
		'type': 'move',
		'direction': direction
	    }));
	    console.log("Paddle movement sent:", direction);
	} else {
	    console.error("WebSocket is not open. Unable to send message.");
	}
    }
    
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        sendPaddleMovement("left");
    } else if (e.key === "ArrowRight") {
        sendPaddleMovement("right");
    } else if (e.key === "ArrowDown") {
	sendPaddleMovement("down");
    } else if (e.key === "ArrowUp") {
	sendPaddleMovement("up");
    }
});

function triggerUpdate() {
	if (gameSocket.readyState === WebSocket.OPEN) {
	    gameSocket.send(JSON.stringify({ action: 'update' })); // Trigger an update
	}
    }
    
setInterval(triggerUpdate, 1000 / 60); // Trigger updates at ~60fps