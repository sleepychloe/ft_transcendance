import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'OrbitControls';

/* logo */

export function initLogo() {
        const canvas = document.getElementById('threejs-canvas');
        if (!canvas) {
                console.error('Canvas element not found');
                return; // Stop execution if canvas is not found
        }

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(500, 500); // Set the size of the canvas
        renderer.setClearColor(0xffffff, 0); // Transparent background

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 0.1, 1000);
        camera.position.set(0, 0, 500);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Bright white light
        directionalLight.position.set(-5, 6, 7);
        scene.add(directionalLight);
        
        let logoMesh;
        // Model loading
        const loader = new GLTFLoader();
        loader.load('static/42_logo.glb', function(gltf) {
            const model = gltf.scene;
            model.position.set(0, 0, 0); // Center the model within the scene
            model.scale.set(0.5, 0.5, 0.5); // Adjust scale if necessary
            model.rotation.x = Math.PI / 2;
            model.rotation.y = Math.PI / 2;
            scene.add(model);

            logoMesh = model;

            // Adjust camera to fit model
            adjustCameraToFitModel(camera, model, renderer);
    
            // Controls for interactive viewing
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set(model.position.x, model.position.y, model.position.z);
            controls.update();
        }, undefined, function(error) {
            console.error('Error loading model:', error);
        });

        function animate() {
                requestAnimationFrame(animate);
        
                // Assume the text mesh is the second object added to the scene
                if (logoMesh) {
                        const time = Date.now() * 0.001;
                        logoMesh.rotation.y = Math.sin(time) * 0.3; // This will continuously rotate the logo around the Y-axis.
                        logoMesh.rotation.z = Math.sin(time) * 0.04;
                        logoMesh.position.x = Math.sin(time * 0.5) * 0.02; // This will move the logo left and right.
                        logoMesh.position.y = Math.sin(time * 0.3) * 0.02; // This will move the logo up and down.
                
                }
        
                renderer.render(scene, camera);
        }
        animate();
    }
    
    // Function to adjust camera position based on model size
    function adjustCameraToFitModel(camera, model, renderer) {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const fov = 80;
        const cameraZ = Math.abs(maxSize / (2 * Math.tan(fov / 2)));
        
        camera.position.z = center.z + 3 * cameraZ;
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(500, 500);
}

/* 3d game */

export function start3dMode() {
	document.getElementById("modeSelection").style.display = "block";
	document.getElementById("startButton").style.display = "block";
    document.getElementById("gameDashboard").style.display = "none";

	const button = document.getElementById('3dMode');
	button.addEventListener('click', handleButtonClick);
}

function handleButtonClick() {
	document.getElementById("modeSelection").style.display = "block";
	document.getElementById("startButton").style.display = "none";
	gameInProgress = true;
	local3dMode = true;;
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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 0;
    camera.position.z = 30;

    const canvas = document.getElementById('pong3dCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(800, 400);
    renderer.setClearColor(0x000000); // Set background color

    // Add Phong lighting
    const ambientLight = new THREE.AmbientLight(0x656565); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 5, 10);
    scene.add(directionalLight);

    // Add boundaries
    const boundaryGeometryLR = new THREE.BoxGeometry(0.2, 20, 20);
    const boundaryGeometryDU = new THREE.BoxGeometry(30, 0.2, 20);
    const boundaryGeometryBF = new THREE.BoxGeometry(30, 20, 0.2);

    const boundaryMaterialLR = new THREE.MeshPhongMaterial({ 
        color: 0x00ffff, 
        wireframe: false, 
        transparent: true,
        opacity: 0.3
    });
    const boundaryMaterialUD = new THREE.MeshPhongMaterial({ 
        color: 0xffff00, 
        wireframe: false, 
        transparent: true,
        opacity: 0.3
    });
    const boundaryMaterialB = new THREE.MeshPhongMaterial({ 
        color: 0xff00ff, 
        wireframe: false, 
        transparent: true, 
        opacity: 0.3
    });
    const boundaryMaterialF = new THREE.MeshPhongMaterial({ 
        color: 0xff00ff, 
        wireframe: false, 
        transparent: true, 
        opacity: 0
    });
    const boundaryL = new THREE.Mesh(boundaryGeometryLR, boundaryMaterialLR);
    const boundaryR = new THREE.Mesh(boundaryGeometryLR, boundaryMaterialLR);
    const boundaryD = new THREE.Mesh(boundaryGeometryDU, boundaryMaterialUD);
    const boundaryU = new THREE.Mesh(boundaryGeometryDU, boundaryMaterialUD);
    const boundaryB = new THREE.Mesh(boundaryGeometryBF, boundaryMaterialB);
    const boundaryF = new THREE.Mesh(boundaryGeometryBF, boundaryMaterialF);

    boundaryL.position.x = -15;
    boundaryR.position.x = 15;
    boundaryD.position.y = -10;
    boundaryU.position.y = 10;
    boundaryB.position.z = -10;
    boundaryF.position.z = 10;
    scene.add(boundaryL, boundaryR, boundaryD, boundaryU, boundaryB, boundaryF);

    // Add paddles and ball with Phong material
    const paddleGeometry = new THREE.BoxGeometry(0.5, 4, 4);
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0x555555, specular: 0x555555, shininess: 30 });
    paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    scene.add(paddle1, paddle2);
    paddle1.position.x = -14.75;
    paddle2.position.x = 14.75;

    const ballGeometry = new THREE.SphereGeometry(0.75, 32, 32);
    ball = new THREE.Mesh(ballGeometry, paddleMaterial); // Using the same Phong material for consistency
    scene.add(ball);

    // Initialize OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Optional, but this gives a nice inertia feel
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2; // Limit the camera to 180 degrees vertical movement
    controls.minDistance = 10; // Minimum zoom distance
    controls.maxDistance = 50; // Maximum zoom distance
    // Disable keys
    controls.enableKeys = false;
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    // Update objects' positions here
    ball.position.x += ballSpeed.x;
    ball.position.y += ballSpeed.y;
    ball.position.z += ballSpeed.z;

    // Collision detection with paddles
    checkPaddleCollision();

    // Boundary constraints for ball movement
    checkBallBoundaries();

    // Update controls
    controls.update();

    // Collision detection and game logic
    renderer.render(scene, camera); // Now renderer is accessible here
}

export function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = undefined; // Reset the ID
        }
}

function checkPaddleCollision() {
    // Adjusting collision checks to account for updated paddle size: 0.5 (x), 4 (y), and 4 (z)

    // Check collision with paddle1
    if (ball.position.x <= paddle1.position.x + 0.25 && ball.position.x >= paddle1.position.x - 0.25) { // Assuming the ball's x position is within the paddle's width
        if (ball.position.y <= paddle1.position.y + 2 && ball.position.y >= paddle1.position.y - 2 && // Checking y boundaries
            ball.position.z <= paddle1.position.z + 2 && ball.position.z >= paddle1.position.z - 2) { // Checking z boundaries
                // createBoundaryHitEffect(new THREE.Vector3(ball.position.x, ball.position.y, ball.position.z));
                ballSpeed.x = -ballSpeed.x; // Reverse X direction
            // Optionally, reverse y or z direction based on the game's physics
        }
    }

    // Check collision with paddle2
    if (ball.position.x <= paddle2.position.x + 0.25 && ball.position.x >= paddle2.position.x - 0.25) { // Adjusting x check for paddle's width
        if (ball.position.y <= paddle2.position.y + 2 && ball.position.y >= paddle2.position.y - 2 && // Adjusting for paddle's height
            ball.position.z <= paddle2.position.z + 2 && ball.position.z >= paddle2.position.z - 2) { // Adjusting for paddle's depth
                // createBoundaryHitEffect(new THREE.Vector3(ball.position.x, ball.position.y, ball.position.z));
                ballSpeed.x = -ballSpeed.x; // Reverse X direction
            // Optionally, adjust y or z direction based on collision logic
        }
    }

	if (ball.position.x <= -14.5 || ball.position.x >= 14.5) {
        let winner = ball.position.x < 0 ? 'Player 1' : 'Player 2';
        alert(`Winner: ${winner}`);
        gameInProgress = false;
        local3dMode = false;
        stopAnimation();
        start3dMode();
    }
}

function createBoundaryHitEffect(position) {
    // Define the geometry and material for the hit effect sphere
    const effectGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const effectMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hitEffect = new THREE.Mesh(effectGeometry, effectMaterial);

    // Set the position of the hit effect sphere
    hitEffect.position.set(position.x, position.y, position.z);

    // Add the hit effect sphere to the scene
    scene.add(hitEffect);
    // Remove the hit effect sphere after 0.5 seconds
    setTimeout(() => {
        scene.remove(hitEffect);
    }, 500);
}

function checkBallBoundaries() {
    // Check Y boundaries (assuming a vertical playfield)
    if (ball.position.y <= -9.5 || ball.position.y >= 9.5) {
        createBoundaryHitEffect(new THREE.Vector3(ball.position.x, ball.position.y <= -9.5 ? -10 : 10, ball.position.z));
        ballSpeed.y = -ballSpeed.y; // Reverse Y direction
    }

    // Check Z boundaries
    if (ball.position.z <= -9.5|| ball.position.z >= 9.5) {
        createBoundaryHitEffect(new THREE.Vector3(ball.position.x, ball.position.y, ball.position.z <= -9.5 ? -10 : 10));
        ballSpeed.z = -ballSpeed.z; // Reverse Z direction
    }
}
