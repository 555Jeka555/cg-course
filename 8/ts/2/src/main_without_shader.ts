import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.PointLight(0xffffff, 100, 100);
light.position.set(5, 8, 5);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.bias = -0.001;
scene.add(light);

// const lightHelper = new THREE.PointLightHelper(light);
// scene.add(lightHelper);
// const gridHelper = new THREE.GridHelper(20, 20);
// scene.add(gridHelper);

class CustomMaterial extends THREE.MeshStandardMaterial {
    private ambientColor: THREE.Color;
    private specularColor: THREE.Color;
    private shininess: number;

    constructor(params) {
        super(params);
        this.ambientColor = params.ambientColor || new THREE.Color(0xffffff);
        this.specularColor = params.specularColor || new THREE.Color(0x111111);
        this.shininess = params.shininess || 30;
    }
}

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new CustomMaterial({
        color: 0xff0000,
        ambientColor: 0x00ff00,
        specularColor: 0xffffff,
        shininess: 100,
        roughness: 0.1,
        metalness: 0.5
    })
);
sphere.position.set(-2, 1, 0);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new CustomMaterial({
        color: 0x00ff00,
        ambientColor: 0x0000ff,
        specularColor: 0xffffff,
        shininess: 50,
        roughness: 0.3,
        metalness: 0.3
    })
);
cube.position.set(2, 1, 0);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.2
    })
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.y += 0.01;
    cube.rotation.x += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();