// function start3dMode() {
// 	console.log('3d');
// }

import * as THREE from 'https://unpkg.com/three@0.108.0/build/three.module.js';

let scene, camera, renderer; // Declare renderer here to make it accessible globally in this script
let paddle1, paddle2, ball;
let ballSpeed = { x: 0.03, y: 0.01, z: 0.03 };

window.start3dMode = function() {
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("gameDashboard").style.display = "block";
    init();
    animate();
};

function init() {
    // Setup scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 5;
    camera.position.z = 30;

    const canvas = document.getElementById('pong3dCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(800, 400);
    renderer.setClearColor(0x000000); // Set background color

    // Add Phong lighting
    const ambientLight = new THREE.AmbientLight(0x656565); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 20, 5);
    scene.add(directionalLight);

    // Add boundaries
    const boundaryGeometryLR = new THREE.BoxGeometry(0.2, 20, 20);
    const boundaryGeometryB = new THREE.BoxGeometry(30, 20, 0.2);
    const boundaryMaterialLR = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    const boundaryMaterialB = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
    const boundaryL = new THREE.Mesh(boundaryGeometryLR, boundaryMaterialLR);
    const boundaryR = new THREE.Mesh(boundaryGeometryLR, boundaryMaterialLR);
    const boundaryB = new THREE.Mesh(boundaryGeometryB, boundaryMaterialB);

    boundaryL.position.x = -15;
    boundaryR.position.x = 15;
    boundaryB.position.z = -10;
    scene.add(boundaryL, boundaryR, boundaryB);

    // Add paddles and ball with Phong material
    const paddleGeometry = new THREE.BoxGeometry(0.5, 4, 4);
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x555555, shininess: 30 });
    paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    scene.add(paddle1, paddle2);
    paddle1.position.x = -15;
    paddle2.position.x = 15;

    const ballGeometry = new THREE.SphereGeometry(0.75, 32, 32);
    ball = new THREE.Mesh(ballGeometry, paddleMaterial); // Using the same Phong material for consistency
    scene.add(ball);
}

function animate() {
    requestAnimationFrame(animate);

    // Update objects' positions here
    ball.position.x += ballSpeed.x;
    ball.position.y += ballSpeed.y;
    ball.position.z += ballSpeed.z;

    // Collision detection with paddles
    checkPaddleCollision();

    // Boundary constraints for ball movement
    checkBallBoundaries();

    // Collision detection and game logic
    renderer.render(scene, camera); // Now renderer is accessible here
}

function checkPaddleCollision() {
    // Adjusting collision checks to account for updated paddle size: 0.5 (x), 4 (y), and 4 (z)

    // Check collision with paddle1
    if (ball.position.x <= paddle1.position.x + 0.25 && ball.position.x >= paddle1.position.x - 0.25) { // Assuming the ball's x position is within the paddle's width
        if (ball.position.y <= paddle1.position.y + 2 && ball.position.y >= paddle1.position.y - 2 && // Checking y boundaries
            ball.position.z <= paddle1.position.z + 2 && ball.position.z >= paddle1.position.z - 2) { // Checking z boundaries
            ballSpeed.x = -ballSpeed.x; // Reverse X direction
            // Optionally, reverse y or z direction based on the game's physics
        }
    }

    // Check collision with paddle2
    if (ball.position.x <= paddle2.position.x + 0.25 && ball.position.x >= paddle2.position.x - 0.25) { // Adjusting x check for paddle's width
        if (ball.position.y <= paddle2.position.y + 2 && ball.position.y >= paddle2.position.y - 2 && // Adjusting for paddle's height
            ball.position.z <= paddle2.position.z + 2 && ball.position.z >= paddle2.position.z - 2) { // Adjusting for paddle's depth
            ballSpeed.x = -ballSpeed.x; // Reverse X direction
            // Optionally, adjust y or z direction based on collision logic
        }
    }
}

function checkBallBoundaries() {
    // Check X boundaries
    // if (ball.position.x <= -15 || ball.position.x >= 15) {
    //     ballSpeed.x = -ballSpeed.x; // Reverse X direction
    // }

    // Check Y boundaries (assuming a vertical playfield)
    if (ball.position.y <= -10 || ball.position.y >= 10) {
        ballSpeed.y = -ballSpeed.y; // Reverse Y direction
    }

    // Check Z boundaries
    if (ball.position.z <= -10 || ball.position.z >= 5) {
        ballSpeed.z = -ballSpeed.z; // Reverse Z direction
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
    switch(event.key) {
        case 'w': paddle1.position.y += 0.5; break;
        case 's': paddle1.position.y -= 0.5; break;
        case 'a': paddle1.position.z += 0.5; break; // Corrected direction for consistent movement
        case 'd': paddle1.position.z -= 0.5; break; // Corrected direction for consistent movement
        case 'ArrowUp': paddle2.position.y += 0.5; break;
        case 'ArrowDown': paddle2.position.y -= 0.5; break;
        case 'ArrowLeft': paddle2.position.z -= 0.5; break; // Corrected direction for consistent movement
        case 'ArrowRight': paddle2.position.z += 0.5; break; // Corrected direction for consistent movement
    }
    checkPaddleBoundaries();
});
