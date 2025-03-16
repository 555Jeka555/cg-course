import * as THREE from 'three';

export class Crankcase {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3) {
        const geometry = new THREE.BoxGeometry(3, 5, 5.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.5
        });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.copy(position);
    }
}