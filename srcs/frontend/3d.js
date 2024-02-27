import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'OrbitControls';

/* logo */

export function initLogo() {
        const canvas = document.getElementById('threejs-canvas');
        if (!canvas) {
                console.error('Canvas element not found');
                return;
        }

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(500, 500);
        renderer.setClearColor(0xffffff, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 0.1, 1000);
        camera.position.set(0, 0, 500);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-5, 6, 7);
        scene.add(directionalLight);
        
        let logoMesh;
        // Model loading
        const loader = new GLTFLoader();
        loader.load('static/42_logo.glb', function(gltf) {
            const model = gltf.scene;
            model.position.set(0, 0, 0);
            model.scale.set(0.5, 0.5, 0.5);
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

                if (logoMesh) {
                        const time = Date.now() * 0.001;
                        logoMesh.rotation.y = Math.sin(time) * 0.3; 
                        logoMesh.rotation.z = Math.sin(time) * 0.04;
                        logoMesh.position.x = Math.sin(time * 0.5) * 0.02;
                        logoMesh.position.y = Math.sin(time * 0.3) * 0.02;
                
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
	local3dMode = true;
    paddleHit = 0;
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
    cameraLeft = new THREE.PerspectiveCamera(75, 350 / 350, 0.1, 1000);
    cameraRight = new THREE.PerspectiveCamera(75, 350 / 350, 0.1, 1000);

    cameraLeft.position.set(-30, 12, 0);
    cameraLeft.lookAt(new THREE.Vector3(0, 10, 0));

    cameraRight.position.set(30, 12, 0);
    cameraRight.lookAt(new THREE.Vector3(0, 10, 0));

    const canvas = document.getElementById('pong3dCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(800, 400);
    renderer.setClearColor(0x000000);

    rendererLeft = new THREE.WebGLRenderer({ canvas: document.getElementById('pong3dLeft') });
    rendererLeft.setSize(390, 390);
    rendererLeft.setClearColor(0x000000);

    rendererRight = new THREE.WebGLRenderer({ canvas: document.getElementById('pong3dRight') });
    rendererRight.setSize(390, 390);
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
    directionalLight4.position.set(-25, 0, 0);
    const directionalLight5 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight5.position.set(25, 0, 0);
    const directionalLight6 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight6.position.set(0, -10, 0);
    const directionalLight7 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight7.position.set(0, 10, 0);
    
    
    scene.add(directionalLight1, directionalLight2, directionalLight3,
        directionalLight4, directionalLight5, directionalLight6, directionalLight7);

    // Add boundaries
    const boundaryGeometryLR = new THREE.BoxGeometry(0.2, 20, 20);
    const boundaryGeometryDU = new THREE.BoxGeometry(30, 0.2, 20);
    const boundaryGeometryBF = new THREE.BoxGeometry(30, 20, 0.2);

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

    boundaryL.position.x = -15;
    boundaryR.position.x = 15;
    boundaryD.position.y = -10;
    boundaryU.position.y = 10;
    boundaryB.position.z = -10;
    boundaryF.position.z = 10;
    scene.add(boundaryL, boundaryR, boundaryD, boundaryU, boundaryB, boundaryF);

    // Add paddles and ball
    const paddleGeometry = new THREE.BoxGeometry(0.5, 4, 4);
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0x999999});
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
                createBoundaryHitEffect(new THREE.Vector3(-15, ball.position.y, ball.position.z), 0x0000ff, 300);
        }
    }

    // Paddle2
    if (ball.position.x <= paddle2.position.x + 0.25 + 0.375 && ball.position.x >= paddle2.position.x - 0.25 - 0.375) {
        if (ball.position.y <= paddle2.position.y + 2 && ball.position.y >= paddle2.position.y - 2 &&
            ball.position.z <= paddle2.position.z + 2 && ball.position.z >= paddle2.position.z - 2) {
                ballSpeed.x = -ballSpeed.x;
                paddleHit = 1;
                createBoundaryHitEffect(new THREE.Vector3(15, ball.position.y, ball.position.z), 0x0000ff, 300);
        }
    }

    if (ball.position.x < -9.5 && ballSpeed.x < 0)
        createBoundaryHitEffect(new THREE.Vector3(-15, ball.position.y, ball.position.z), 0x000000, 1);
    if (ball.position.x > 9.5 && ballSpeed.x > 0)
        createBoundaryHitEffect(new THREE.Vector3(15, ball.position.y, ball.position.z), 0x000000, 1);

    if (ball.position.x < -14.3){
        createBoundaryHitEffect(new THREE.Vector3(-15, ball.position.y, ball.position.z), 0xff0000, 300);
    }
    if (ball.position.x > 14.3) {
        createBoundaryHitEffect(new THREE.Vector3(15, ball.position.y, ball.position.z), 0xff0000, 300);
    }
}

function checkBallBoundaries() {
    if (ball.position.y <= -9.5 - 0.375 || ball.position.y >= 9.5 - 0.375) {
        ballSpeed.y = -ballSpeed.y;
    }

    if (ball.position.z <= -9.5 - 0.375 || ball.position.z >= 9.5 - 0.375) {
        ballSpeed.z = -ballSpeed.z;
    }

    if ((ball.position.x <= -14.5 || ball.position.x >= 14.5)
            && paddleHit === 0) {
        let winner = ball.position.x > 0 ? 'Player 1' : 'Player 2';
        alert(`Winner: ${winner}`);
        gameInProgress = false;
        local3dMode = false;
        stopAnimation();
        start3dMode();
    }
}
