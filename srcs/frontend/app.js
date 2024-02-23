import { routes } from "./routes.js";

const app = async () => {
        const pageMatch = routes.map(route => {
                return {
                        route: route,
                        isMatch: window.location.pathname === route.path,
                };
        });
        let match = pageMatch.find(page => page.isMatch);
        document.getElementById('app').innerHTML = match.route.template;
        document.getElementsByClassName('main-title')[0].innerHTML = match.route.name;
        let scriptTag = match.route.script;
        if (scriptTag !== null)
                document.getElementsByTagName("head")[0].appendChild(scriptTag);
        
        // insert pong.js script inside HTML head on game page load
        if ((match.route.path !== '/' && match.route.path !== '/multi') && !document.getElementById('script-path-./game/pong.js'))
        {
                var tag = document.createElement("script");
                tag.src = "./game/pong.js";
                tag.id = "script-path-./game/pong.js";
                document.getElementsByTagName("head")[0].appendChild(tag);
        }
        if (match.route.path === '/') {
                // Ensure the DOM update has been processed
                requestAnimationFrame(() => {
                        initThreeJs();
                });
        }
}

// on user press forward
const navigate = url => {
        window.history.pushState({}, "", url);
        app();
};

// on user press back
document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('popstate', function (event) {
                // stop pong.js
                // will try to find another way to avoid try catch block
                // if (window.location.pathname === '/')
                try {
                        resetToHomeScreen();
                } catch {
                        console.log("Failed to Reset the Game (game was not loaded)");
                }
                // stop multi page
                //
                app();
        });
        // prevent default behaviour for all HTML <a> tags
        // instead pass uri to SPA router
        document.body.addEventListener('click', event => {
                const target = event.target.closest('a');
                if (!(target instanceof HTMLAnchorElement))
                        return;
                event.preventDefault();
                navigate(target.href);
        });

        app();
});

import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'OrbitControls';


function initThreeJs() {
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
        loader.load('./42_logo.glb', function(gltf) {
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
