import * as THREE from 'three';

export class Piston {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3) {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
    }

    move(y: number): void {
        this.mesh.position.y = y;
    }
}