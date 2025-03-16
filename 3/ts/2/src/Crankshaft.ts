import * as THREE from 'three';

export class Crankshaft {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3) {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x555555 });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.copy(position);
        this.mesh.rotation.x = Math.PI / 2;
    }

    update(angle: number): void {
        this.mesh.rotation.y = angle;
    }
}