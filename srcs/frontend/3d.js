import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'OrbitControls';

let canvasData = {
    proportion: 0,
    canvasWidth: 0,
    canvasHeight: 0,
};

/* logo */

export function initLogo(canvasData={}) {
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    canvasData['proportion'] = 0.8;

    if (window.innerWidth < window.innerHeight) {
        canvasData['canvasWidth'] = window.innerWidth * canvasData['proportion'];
        canvasData['canvasHeight'] = canvasData['canvasWidth'];
    } else {
        if (isMobileDevice() && window.innerHeight < 600) {
            canvasData['proportion'] = 0.4;
        }
        canvasData['canvasHeight'] = window.innerHeight * canvasData['proportion'];
        canvasData['canvasWidth'] = canvasData['canvasHeight'];
    }

    if (canvasData['canvasWidth'] > 500) {
        canvasData['canvasWidth'] = 500;
        canvasData['canvasHeight'] = 500;
    }

    const canvas = document.getElementById('threejs-canvas');
    if (!canvas) {
            return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvasData['canvasWidth'], canvasData['canvasHeight']);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, canvasData['canvasWidth'] / canvasData['canvasHeight'], 0.1, 1000);
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
        adjustCameraToFitModel(camera, model, renderer, canvas, canvasData);

        // Controls for interactive viewing
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(model.position.x, model.position.y, model.position.z);
        controls.update();
        controls.enableKeys = false;
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

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {

        if (window.innerWidth < window.innerHeight) {
            canvasData['canvasWidth'] = window.innerWidth * canvasData['proportion'];
            canvasData['canvasHeight'] = canvasData['canvasWidth'];
        } else {
            if (isMobileDevice() && window.innerHeight < 600) {
                canvasData['proportion'] = 0.4;
            }
            canvasData['canvasHeight'] = window.innerHeight * canvasData['proportion'];
            canvasData['canvasWidth'] = canvasData['canvasHeight'];
        }

        if (canvasData['canvasWidth'] > 500) {
            canvasData['canvasWidth'] = 500;
            canvasData['canvasHeight'] = 500;
        }
        camera.aspect = canvasData['canvasWidth'] / canvasData['canvasHeight'];
        camera.updateProjectionMatrix();
        renderer.setSize(canvasData['canvasWidth'], canvasData['canvasHeight']);
        renderer.setPixelRatio(window.devicePixelRatio);
    }
}

// Function to adjust camera position based on model size
function adjustCameraToFitModel(camera, model, renderer, canvas, canvasData={}) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const fov = 80;
    const cameraZ = Math.abs(maxSize / (2 * Math.tan(fov / 2)));
    
    camera.position.z = center.z + 3 * cameraZ;
    const aspect = canvasData['canvasWidth'] / canvasData['canvasHeight'];
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasData['canvasWidth'], canvasData['canvasHeight']);
    renderer.setPixelRatio(window.devicePixelRatio);
}
