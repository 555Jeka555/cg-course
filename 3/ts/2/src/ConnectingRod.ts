import * as THREE from 'three';

export class ConnectingRod {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3) {
        const geometry = new THREE.BoxGeometry(0.2, 1.8, 0.2);
        const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.copy(position);
    }

    update(pistonPosition: THREE.Vector3, crankAngle: number): void {
        // Позиция шатуна (середина между поршнем и коленчатым валом)
        this.mesh.position.y = (pistonPosition.y - 1);

        this.mesh.rotation.z = crankAngle;
    }
}