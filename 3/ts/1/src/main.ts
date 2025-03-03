import * as THREE from 'three';
import { cardioid } from './Cardioid.ts'
import { xAxis, yAxis, ticksX, ticksY } from './Map.ts'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(xAxis);
scene.add(yAxis);

ticksX.forEach(tick => {
    scene.add(tick);
})

ticksY.forEach(tick => {
    scene.add(tick);
})

scene.add(cardioid);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});