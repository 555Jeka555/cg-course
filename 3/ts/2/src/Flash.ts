import * as THREE from 'three';

export class Flash {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3) {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Желтый цвет по умолчанию
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
    }

    ignite(): void {
        const material = this.mesh.material as THREE.MeshBasicMaterial;
        material.color.set(0xff0000); // Красный цвет при вспышке
    }

    reset(): void {
        const material = this.mesh.material as THREE.MeshBasicMaterial;
        material.color.set(0xffff00); // Желтый цвет в обычном состоянии
    }
}