import * as THREE from 'three';

export class Flywheel {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3) {
        const geometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x555555 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.rotation.x = Math.PI / 2;
    }

    rotate(angle: number): void {
        this.mesh.rotation.z += angle;
    }
}