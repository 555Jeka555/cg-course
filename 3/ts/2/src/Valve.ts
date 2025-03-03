import * as THREE from 'three';

export class Valve {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3, color: number) {
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16);
        const material = new THREE.MeshBasicMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
    }

    open(amount: number): void {
        this.mesh.position.y += amount;
    }
}