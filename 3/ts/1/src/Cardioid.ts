import * as THREE from 'three';

export class Cardioid {
    public mesh: THREE.Line;

    constructor(a: number = 5, step: number = 0.01) {
        const points = [];
        for (let phi = 0; phi <= 2 * Math.PI; phi += step) {
            const r = a * (1 - Math.cos(phi));
            const x = r * Math.cos(phi);
            const y = r * Math.sin(phi);
            points.push(new THREE.Vector3(x, y, 0));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Line(geometry, material);
    }
}