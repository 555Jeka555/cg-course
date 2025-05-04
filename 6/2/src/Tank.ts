import * as THREE from "three";
import {Scene, Vector3} from "three";
import {TankType} from "./TankType.ts";
import {Bullet} from "./Bullet.ts";
import {Effect} from "./Effect.ts";
import {ModelLoader} from "./ModelLoader.ts";

export class Tank {
    public direction: Vector3;
    public mesh: THREE.Group = new THREE.Group();
    public invulnerable: boolean = false;
    public position: Vector3;
    public tankType: TankType;
    public frozen: boolean = false;

    private scene: Scene;
    private isPlayer: boolean;
    private lastShot: number;

    constructor(
        scene: Scene,
        tankType: TankType,
        position: Vector3,
        isPlayer: boolean = false,
    ) {
        this.scene = scene;

        this.tankType = tankType;
        this.position = position;
        this.isPlayer = isPlayer;

        this.lastShot = 0;
        this.createModel();
        this.direction = new THREE.Vector3(0, 0, 1);
    }

    async createModel() {
        this.mesh = await ModelLoader.loadModel(this.tankType.urlModel);
        this.mesh.position.copy(this.position);
        this.mesh.scale.set(0.1, 0.1, 0.1);
        this.scene.add(this.mesh);
    }

    move(direction, deltaTime) {
        // Логика движения танка
        const moveVector = direction.clone().multiplyScalar(this.tankType.speed * deltaTime);
        this.position.add(moveVector);
        this.mesh.position.copy(this.position);

        if (!direction.equals(new THREE.Vector3(0, 0, 0))) {
            this.direction.copy(direction).normalize();
            this.mesh.lookAt(this.position.clone().add(this.direction));
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > this.tankType.shootCooldown) {
            this.lastShot = now;
            const bulletPosition = this.position.clone().add(
                this.direction.clone().multiplyScalar(1.2)
            );
            bulletPosition.y += 0.5;

            return new Bullet(
                bulletPosition,
                this.direction.clone(),
                this.isPlayer ? 'player' : 'enemy'
            );
        }
        return null;
    }

    takeDamage() {
        this.tankType.health--;
        if (this.tankType.health <= 0) {
            this.explode();
            return true;
        }

        return false;
    }

    explode() {
        const effect = new Effect(this.position);
        this.scene.add(effect.mesh);

        this.scene.remove(this.mesh);
    }
}