import * as THREE from 'three';

export class CoolingSystem {
    public mesh: THREE.Mesh;

    constructor(position: THREE.Vector3) {
        const points = [
            new THREE.Vector3(-2, 1, 0),
            new THREE.Vector3(-2, -1, 0),
            new THREE.Vector3(2, -1, 0),
            new THREE.Vector3(2, 1, 0),
            new THREE.Vector3(-2, 1, 0),
        ];

        const tubeGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points),
            64,
            0.1,
            8,
            false
        );

        const material = new THREE.MeshBasicMaterial({
            color: 0x00aaff, // Голубой цвет для воды
            transparent: true,
            opacity: 0.7 // Полупрозрачный материал
        });

        this.mesh = new THREE.Mesh(tubeGeometry, material);
        this.mesh.position.copy(position);
    }
}