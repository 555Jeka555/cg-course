import * as THREE from 'three';

export class SparkPLug {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3) {
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x444444 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
    }
}