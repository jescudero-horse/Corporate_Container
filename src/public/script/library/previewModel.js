/**Import the neccesary modules to preview the models */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.125.2/build/three.module.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/controls/OrbitControls.js';

//Obtein the data of the row using the URL params
const urlParams = new URLSearchParams(window.location.search);
const rowDataJson = urlParams.get('data');

//Store the information from the URL params
const pathFile = JSON.parse(decodeURIComponent(rowDataJson));

//Variable to manage the model
let scene, camera, renderer, controls;

/**
 * Function to configurate the model viewer
 */
function init() {
    //Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    //Camera
    const aspectRatio = 800 / 600;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(0, 0, 10);

    //Render
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);
    document.getElementById('container').appendChild(renderer.domElement);

    //Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    //Light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    //Load STL model
    const loader = new STLLoader();
    loader.load(pathFile, function (geometry) {
        const material = new THREE.MeshPhongMaterial({ color: 0xb2ffc8 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        //Center and scale the model
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;
        const centerX = (boundingBox.max.x + boundingBox.min.x) / 2;
        const centerY = (boundingBox.max.y + boundingBox.min.y) / 2;
        const centerZ = (boundingBox.max.z + boundingBox.min.z) / 2;
        const size = Math.max(
            boundingBox.max.x - boundingBox.min.x,
            boundingBox.max.y - boundingBox.min.y,
            boundingBox.max.z - boundingBox.min.z
        );
        mesh.geometry.translate(-centerX, -centerY, -centerZ);
        camera.position.set(0, 0, size * 1.5);
        controls.update();
    });

    //Animate
    animate();
}

/**
 * Function to apply the animation of the model
 */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/**
 * Function to control 
 */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//Start the control model
init();