let scene, camera, renderer
let cameraLeft, cameraRight, rendererLeft, rendererRight;
let paddle1, paddle2, ball;
let ballSpeed = { x: Math.random() < 0.5 ? (Math.random() + 0.3) * 0.6 * 1 / 5 :(Math.random() + 0.3) * -0.6 * 1 / 5,
                    y: Math.random() < 0.5 ? (Math.random() + 0.1) * 0.8 * 1 / 5 : (Math.random() + 0.1) * -0.8 * 1 / 5,
                    z: Math.random() < 0.5 ? (Math.random() + 0.1) * 0.35 * 1 / 5 : (Math.random() + 0.1) * -0.35 * 1 / 5 };
let controls, controlsLeft, controlsRight;
let animationFrameId;
let gameInProgress;
let local3dMode;
let paddleHit;

function checkPaddleBoundaries() {
	// Paddle 1 boundaries
	paddle1.position.y = Math.max(Math.min(paddle1.position.y, 8), -8);
	paddle1.position.z = Math.max(Math.min(paddle1.position.z, 8), -8);
    
	// Paddle 2 boundaries
	paddle2.position.y = Math.max(Math.min(paddle2.position.y, 8), -8);
	paddle2.position.z = Math.max(Math.min(paddle2.position.z, 8), -8);
}
    
document.addEventListener('keydown', event => {
	if (gameInProgress === true) {
		switch(event.key) {
		case 'w': paddle1.position.y += 2; break;
		case 's': paddle1.position.y -= 2; break;
		case 'a': paddle1.position.z -= 2; break;
		case 'd': paddle1.position.z += 2; break;
		case 'i': paddle2.position.y += 2; break;
		case 'k': paddle2.position.y -= 2; break;
		case 'j': paddle2.position.z += 2; break;
		case 'l': paddle2.position.z -= 2; break;
		}
		checkPaddleBoundaries();
	}
    });
