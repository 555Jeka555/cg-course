import * as THREE from "three";
import {Vector3} from "three";

export enum OWNER_TYPE {
    PLAYER,
    ENEMY,
}

export class Bullet {
    public mesh: THREE.Mesh;
    public owner: OWNER_TYPE;
    public position: Vector3;

    private direction: Vector3;
    private speed: number;

    constructor(position, direction, owner: OWNER_TYPE) {
        this.position = position;
        this.direction = direction;
        this.speed = 3;
        this.owner = owner;
        this.mesh = this.createModel();
    }

    createModel() {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: this.owner === OWNER_TYPE.PLAYER ? 0xffff00 : 0xff0000
        });
        const bullet = new THREE.Mesh(geometry, material);
        bullet.position.copy(this.position);
        return bullet;
    }

    update(deltaTime) {
        this.position.add(this.direction.clone().multiplyScalar(this.speed * deltaTime));
        this.mesh.position.copy(this.position);
    }
}