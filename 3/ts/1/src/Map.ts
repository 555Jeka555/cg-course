import * as THREE from "three";

const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-20, 0, 0),
    new THREE.Vector3(20, 0, 0),
]);
const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
export const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);

const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -20, 0),
    new THREE.Vector3(0, 20, 0),
]);
const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
export const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);

export const ticksX: Array<THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>> = []
const tickStep = 2;
for (let i = -20; i <= 20; i += tickStep) {
    const tickGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, -0.1, 0),
        new THREE.Vector3(i, 0.1, 0),
    ]);
    const tickMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const tick = new THREE.Line(tickGeometry, tickMaterial);
    ticksX.push(tick)
}

export const ticksY: Array<THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>> = []

for (let i = -20; i <= 20; i += tickStep) {
    const tickGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.1, i, 0),
        new THREE.Vector3(0.1, i, 0),
    ]);
    const tickMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const tick = new THREE.Line(tickGeometry, tickMaterial);
    ticksY.push(tick)
}