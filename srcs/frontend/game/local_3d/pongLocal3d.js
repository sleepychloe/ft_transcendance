import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

let game_data = {
    'mainCanvasWidth': 0,
	'mainCanvasHeight': 0,
	'subCanvasWidth': 0,
	'subCanvasHeight': 0,
};

let scene, camera, renderer
let cameraLeft, cameraRight, rendererLeft, rendererRight;
let paddle1, paddle2, ball;
let ballSpeed = {
	x: Math.random() < 0.5 ? (Math.random() + 0.3) * 0.6 * 1 / 5 : (Math.random() + 0.3) * -0.6 * 1 / 5,
	y: Math.random() < 0.5 ? (Math.random() + 0.1) * 0.8 * 1 / 5 : (Math.random() + 0.1) * -0.8 * 1 / 5,
	z: Math.random() < 0.5 ? (Math.random() + 0.1) * 0.35 * 1 / 5 : (Math.random() + 0.1) * -0.35 * 1 / 5
};
let controls, controlsLeft, controlsRight;
let animationFrameId;
let gameInProgress;
let local3dMode;
let paddleHit;

const translations = {
	en: {
		player: "Player",
		winner: "Winner",
	},
	fr: {
		player: "Joueur",
		winner: "Vainqueur",
	},
	ko: {
		player: "플레이어",
		winner: "우승자",
	},
};

const t = translations[currentLanguage];

function isMobileDevice() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function start3dMode() {
	const button = document.getElementById('3dMode');
	button.addEventListener('click', handleButtonClick);
}

function handleButtonClick() {
	document.getElementById("3dMode").setAttribute('disabled', true);
	gameInProgress = true;
	local3dMode = true;
	paddleHit = 0;
	document.getElementById("pong3dCanvas").className = "d-flex";
	let widthMain, heightMain, widthSub, heightSub;
	let proportion = 0.5;

	// mobile mode && rotated
	if (isMobileDevice() && window.screen.width > window.screen.height) {
		heightMain = window.screen.height - 4 - 47;
		if (window.screen.height > 400) {
			heightMain = 400 - 4;
		}
		widthMain = heightMain / proportion;
	} else { 
		if (isMobileDevice()) { // mobile mode && not rotated
			widthMain = window.screen.width - 4;
			if (window.screen.width > 800) {
				widthMain = 800 - 4;
			}
		} else { // web mode
			widthMain = window.innerWidth - 4;
			if (window.innerWidth > 800) {
				widthMain = 800 - 4;
			}
		}
		heightMain = widthMain * proportion;
	}

	widthSub = (widthMain + 4) / 2 - (widthMain + 4) / 40 - 4;
	heightSub = widthSub;

	let pongCanvasMain = document.getElementById('pong3dCanvas');
	if (pongCanvasMain) {
		pongCanvasMain.setAttribute('width', widthMain);
		pongCanvasMain.setAttribute('height', heightMain);
		pongCanvasMain.style.marginBottom = (widthMain + 4) / 20 + 'px';
	}
	let pongCanvasLeft = document.getElementById('pong3dLeft');
	if (pongCanvasLeft) {
		pongCanvasLeft.setAttribute('width', widthSub);
		pongCanvasLeft.setAttribute('height', heightSub);
	}
	let pongCanvasRight = document.getElementById('pong3dRight');
	if (pongCanvasRight) {
		pongCanvasRight.setAttribute('width', widthSub);
		pongCanvasRight.setAttribute('height', heightSub);
		document.getElementById('lowerCanvases').style.gap = (widthMain + 4) / 20 + 'px';
	}

	game_data['mainCanvasWidth'] = widthMain;
	game_data['mainCanvasHeight'] = heightMain;
	game_data['subCanvasWidth'] = widthSub;
	game_data['subCanvasHeight'] = heightSub;

	if (isMobileDevice() && window.innerHeight < 650) {
		document.getElementById("pong3dLeft").className = "d-none";
		document.getElementById("pong3dRight").className = "d-none";
	} else {
		if (gameInProgress === true && pongCanvasLeft && pongCanvasRight) {
			document.getElementById("pong3dLeft").className = "d-flex";
			document.getElementById("pong3dRight").className = "d-flex";
		}
	}

	startMatch();
}

function startMatch() {
	if (local3dMode === true) {
		init();
		animate();
	}
}

function init() {

	// Setup scene
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, game_data['mainCanvasWidth'] / game_data['mainCanvasHeight'], 0.1, 1000);
	camera.position.y = 0;
	camera.position.z = 30;

	cameraLeft = new THREE.PerspectiveCamera(75, game_data['subCanvasWidth'] / game_data['subCanvasHeight'], 0.1, 1000);
	cameraRight = new THREE.PerspectiveCamera(75, game_data['subCanvasWidth'] / game_data['subCanvasHeight'], 0.1, 1000);

	cameraLeft.position.set(-45, 12, 0);
	cameraLeft.lookAt(new THREE.Vector3(0, 50, 0));

	cameraRight.position.set(45, 12, 0);
	cameraRight.lookAt(new THREE.Vector3(0, 50, 0));

	const canvas = document.getElementById('pong3dCanvas');
	renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	canvas.width = game_data['mainCanvasWidth'];
	canvas.height = game_data['mainCanvasHeight'];
	renderer.setSize(game_data['mainCanvasWidth'], game_data['mainCanvasHeight']);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x000000);

	rendererLeft = new THREE.WebGLRenderer({ canvas: document.getElementById('pong3dLeft') });
	rendererLeft.setSize(game_data['subCanvasWidth'], game_data['subCanvasHeight']);
	rendererLeft.setClearColor(0x000000);

	rendererRight = new THREE.WebGLRenderer({ canvas: document.getElementById('pong3dRight') });
	rendererRight.setSize(game_data['subCanvasWidth'], game_data['subCanvasHeight']);
	rendererRight.setClearColor(0x000000);

	// lighting
	const ambientLight = new THREE.AmbientLight(0x656565);
	scene.add(ambientLight);
	const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight1.position.set(0, 0, 0);
	const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight2.position.set(5, 5, 15);
	const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight3.position.set(-5, -5, 15);

	const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight4.position.set(-35, 0, 0);
	const directionalLight5 = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight5.position.set(35, 0, 0);
	const directionalLight6 = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight6.position.set(0, -10, 0);
	const directionalLight7 = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight7.position.set(0, 10, 0);


	scene.add(directionalLight1, directionalLight2, directionalLight3,
		directionalLight4, directionalLight5, directionalLight6, directionalLight7);

	// Add boundaries
	const boundaryGeometryLR = new THREE.BoxGeometry(0.2, 20, 20);
	const boundaryGeometryDU = new THREE.BoxGeometry(50, 0.2, 20);
	const boundaryGeometryBF = new THREE.BoxGeometry(50, 20, 0.2);

	const boundaryMaterialLR = new THREE.MeshPhongMaterial({
		color: 0x555555,
		transparent: true,
		opacity: 0.2
	});
	const boundaryMaterialUD = new THREE.MeshPhongMaterial({
		color: 0x555555,
		transparent: true,
		opacity: 0.2
	});
	const boundaryMaterialB = new THREE.MeshPhongMaterial({
		color: 0x555555,
		transparent: true,
		opacity: 0.15
	});
	const boundaryMaterialF = new THREE.MeshPhongMaterial({
		color: 0x000000,
		transparent: true,
		opacity: 0
	});
	const boundaryL = new THREE.Mesh(boundaryGeometryLR, boundaryMaterialLR);
	const boundaryR = new THREE.Mesh(boundaryGeometryLR, boundaryMaterialLR);
	const boundaryD = new THREE.Mesh(boundaryGeometryDU, boundaryMaterialUD);
	const boundaryU = new THREE.Mesh(boundaryGeometryDU, boundaryMaterialUD);
	const boundaryB = new THREE.Mesh(boundaryGeometryBF, boundaryMaterialB);
	const boundaryF = new THREE.Mesh(boundaryGeometryBF, boundaryMaterialF);

	boundaryL.position.x = -25;
	boundaryR.position.x = 25;
	boundaryD.position.y = -10;
	boundaryU.position.y = 10;
	boundaryB.position.z = -10;
	boundaryF.position.z = 10;
	scene.add(boundaryL, boundaryR, boundaryD, boundaryU, boundaryB, boundaryF);

	// Add paddles and ball
	const paddleGeometry = new THREE.BoxGeometry(0.5, 3, 3);
	const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
	paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
	paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
	scene.add(paddle1, paddle2);
	paddle1.position.x = -24.75;
	paddle2.position.x = 24.75;

	const ballGeometry = new THREE.SphereGeometry(0.75, 32, 32);
	ball = new THREE.Mesh(ballGeometry, paddleMaterial); // Using the same Phong material for consistency
	scene.add(ball);

	// Initialize OrbitControls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.maxPolarAngle = Math.PI / 2; // Limit the camera to 180 degrees vertical movement
	controls.minDistance = 10; // Minimum zoom distance
	controls.maxDistance = 50; // Maximum zoom distance
	controls.enableKeys = false;

	controlsLeft = new OrbitControls(cameraLeft, rendererLeft.domElement);
	controlsLeft.enableDamping = true;
	controlsLeft.dampingFactor = 0.05;
	controlsLeft.screenSpacePanning = false;
	controlsLeft.maxPolarAngle = Math.PI / 2;
	controlsLeft.minDistance = 10; // Minimum zoom distance
	controlsLeft.maxDistance = 50; // Maximum zoom distance
	controlsLeft.enableKeys = false;

	controlsRight = new OrbitControls(cameraRight, rendererRight.domElement);
	controlsRight.enableDamping = true;
	controlsRight.dampingFactor = 0.05;
	controlsRight.screenSpacePanning = false;
	controlsRight.maxPolarAngle = Math.PI / 2;
	controlsRight.minDistance = 10; // Minimum zoom distance
	controlsRight.maxDistance = 50; // Maximum zoom distance
	controlsRight.enableKeys = false;

	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
	let widthMain, heightMain, widthSub, heightSub;
	let proportion = 0.5;

	// mobile mode && rotated
	if (isMobileDevice() && window.screen.width > window.screen.height) {
		heightMain = window.innerHeight - 4 - 47;
		if (window.screen.height > 400) {
			heightMain = 400 - 4;
		}
		widthMain = heightMain / proportion;
	} else {
		if (isMobileDevice()) { // mobile mode && not rotated
			widthMain = window.screen.width - 4;
			if (window.screen.width > 800) {
				widthMain = 800 - 4;
			}
		} else { // web mode
			widthMain = window.innerWidth - 4;
			if (window.innerWidth > 800) {
				widthMain = 800 - 4;
			}
		}
		heightMain = widthMain * proportion;
	}
	widthSub = (widthMain + 4) / 2 - (widthMain + 4) / 40 - 4;
	heightSub = widthSub;

	let pongCanvasMain = document.getElementById('pong3dCanvas');
	if (pongCanvasMain) {
		pongCanvasMain.setAttribute('width', widthMain);
		pongCanvasMain.setAttribute('height', heightMain);
		pongCanvasMain.style.marginBottom = (widthMain + 4) / 20 + 'px';
	}
	let pongCanvasLeft = document.getElementById('pong3dLeft');
	if (pongCanvasLeft) {
		pongCanvasLeft.setAttribute('width', widthSub);
		pongCanvasLeft.setAttribute('height', heightSub);
	}
	let pongCanvasRight = document.getElementById('pong3dRight');
	if (pongCanvasRight) {
		pongCanvasRight.setAttribute('width', widthSub);
		pongCanvasRight.setAttribute('height', heightSub);
		document.getElementById('lowerCanvases').style.gap = (widthMain + 4) / 20 + 'px';
	}
	
	game_data['mainCanvasWidth'] = widthMain;
	game_data['mainCanvasHeight'] = heightMain;
	game_data['subCanvasWidth'] = widthSub;
	game_data['subCanvasHeight'] = heightSub;

	camera.aspect = game_data['mainCanvasWidth'] / game_data['mainCanvasHeight'];
	camera.updateProjectionMatrix();
	renderer.setSize(game_data['mainCanvasWidth'], game_data['mainCanvasHeight']);
	renderer.setPixelRatio(window.devicePixelRatio);

	cameraLeft.aspect = game_data['subCanvasWidth'] / game_data['subCanvasHeight'];
	cameraLeft.updateProjectionMatrix();
	rendererLeft.setSize(game_data['subCanvasWidth'], game_data['subCanvasHeight']);

	cameraRight.aspect = game_data['subCanvasWidth'] / game_data['subCanvasHeight'];
	cameraRight.updateProjectionMatrix();
	rendererRight.setSize(game_data['subCanvasWidth'], game_data['subCanvasHeight']);

	if (isMobileDevice() && window.innerHeight < 650 && pongCanvasLeft && pongCanvasRight) {
		pongCanvasLeft.className = "d-none";
		pongCanvasRight.className = "d-none";
	} else {
		if (gameInProgress === true && pongCanvasLeft && pongCanvasRight) {
			console.log('flex');
			pongCanvasLeft.className = "d-flex";
			pongCanvasRight.className = "d-flex";
		}
	}
}

function animate() {
	animationFrameId = requestAnimationFrame(animate);
	ball.position.x += ballSpeed.x;
	ball.position.y += ballSpeed.y;
	ball.position.z += ballSpeed.z;

	paddleHit = 0;
	checkPaddleCollision();
	checkBallBoundaries();

	controls.update();

	renderer.render(scene, camera);
	rendererLeft.render(scene, cameraLeft);
	rendererRight.render(scene, cameraRight);
}

export function stopAnimation() {
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = undefined;
		gameInProgress = false;
		document.getElementById("3dMode").removeAttribute('disabled');
		window.removeEventListener('resize', onWindowResize);
	}
}

function createBoundaryHitEffect(position, color, time) {
	// Define the geometry and material for the hit effect sphere
	const effectGeometry = new THREE.SphereGeometry(0.75, 16, 16);
	const effectMaterial = new THREE.MeshBasicMaterial({ color: color });
	const hitEffect = new THREE.Mesh(effectGeometry, effectMaterial);

	// Set the position of the hit effect sphere
	hitEffect.position.set(position.x, position.y, position.z);

	// Add the hit effect sphere to the scene
	scene.add(hitEffect);
	// Remove the hit effect sphere after 0.5 seconds
	setTimeout(() => {
		scene.remove(hitEffect);
	}, time);
}

function checkPaddleCollision() {
	// Paddle2
	if (ball.position.x <= paddle1.position.x + 0.25 + 0.375 && ball.position.x >= paddle1.position.x - 0.25 - 0.375) {
		if (ball.position.y <= paddle1.position.y + 2 && ball.position.y >= paddle1.position.y - 2 &&
			ball.position.z <= paddle1.position.z + 2 && ball.position.z >= paddle1.position.z - 2) {
			ballSpeed.x = -ballSpeed.x;
			paddleHit = 1;
			createBoundaryHitEffect(new THREE.Vector3(-25, ball.position.y, ball.position.z), 0x0000ff, 300);
		}
	}

	// Paddle2
	if (ball.position.x <= paddle2.position.x + 0.25 + 0.375 && ball.position.x >= paddle2.position.x - 0.25 - 0.375) {
		if (ball.position.y <= paddle2.position.y + 2 && ball.position.y >= paddle2.position.y - 2 &&
			ball.position.z <= paddle2.position.z + 2 && ball.position.z >= paddle2.position.z - 2) {
			ballSpeed.x = -ballSpeed.x;
			paddleHit = 1;
			createBoundaryHitEffect(new THREE.Vector3(25, ball.position.y, ball.position.z), 0x0000ff, 300);
		}
	}

	if (ball.position.x < -20 && ballSpeed.x < 0)
		createBoundaryHitEffect(new THREE.Vector3(-25, ball.position.y, ball.position.z), 0x000000, 1);
	if (ball.position.x > 20 && ballSpeed.x > 0)
		createBoundaryHitEffect(new THREE.Vector3(25, ball.position.y, ball.position.z), 0x000000, 1);

	if (ball.position.x < -24.3) {
		createBoundaryHitEffect(new THREE.Vector3(-25, ball.position.y, ball.position.z), 0xff0000, 300);
	}
	if (ball.position.x > 24.3) {
		createBoundaryHitEffect(new THREE.Vector3(25, ball.position.y, ball.position.z), 0xff0000, 300);
	}
}

function checkBallBoundaries() {
	if (ball.position.y <= -9.5 - 0.375 || ball.position.y >= 9.5 - 0.375) {
		ballSpeed.y = -ballSpeed.y;
	}

	if (ball.position.z <= -9.5 - 0.375 || ball.position.z >= 9.5 - 0.375) {
		ballSpeed.z = -ballSpeed.z;
	}

	if ((ball.position.x <= -24.5 || ball.position.x >= 24.5)
		&& paddleHit === 0) {
		let winner = ball.position.x > 0 ? `${t.player}` + ' 1' : `${t.player}` + ' 2';
		alert(`${t.winner}: ${winner}`);
		gameInProgress = false;
		local3dMode = false;
		stopAnimation();
		document.getElementById("pong3dCanvas").className = "d-none";
		document.getElementById("pong3dLeft").className = "d-none";
		document.getElementById("pong3dRight").className = "d-none";
		start3dMode();
	}
}


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
		switch (event.key) {
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
