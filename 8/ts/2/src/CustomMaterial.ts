import * as THREE from "three";

export class CustomMaterial extends THREE.MeshStandardMaterial {
    private ambientColor: THREE.Color;
    private specularColor: THREE.Color;
    private shininess: number;

    constructor(params) {
        super(params);
        this.ambientColor = params.ambientColor || new THREE.Color(0xffffff);
        this.specularColor = params.specularColor || new THREE.Color(0x111111);
        this.shininess = params.shininess || 30;
    }
}