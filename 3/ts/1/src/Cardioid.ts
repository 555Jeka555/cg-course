import * as THREE from "three";

const points = [];
const a = 5;
const step = 0.01;

for (let phi = 0; phi <= 2 * Math.PI; phi += step) {
    const r = a * (1 - Math.cos(phi));
    const x = r * Math.cos(phi);
    const y = r * Math.sin(phi);
    points.push(new THREE.Vector3(x, y, 0));
}

const cardioidGeometry = new THREE.BufferGeometry().setFromPoints(points);
const cardioidMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
export const cardioid = new THREE.Line(cardioidGeometry, cardioidMaterial);