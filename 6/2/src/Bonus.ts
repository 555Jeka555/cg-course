import * as THREE from "three";
import {Scene, Vector3} from "three";
import {ModelLoader} from "./ModelLoader.ts";

export enum BONUS_TYPE {
    BOMB,
    CLOCK,
    HELMET,
    MACHINE_GUN,
    SHIELD,
    STAR,
}

export class Bonus {
    public position: Vector3;
    public mesh: THREE.Group = new THREE.Group();
    public active: boolean;

    private scene: Scene;
    private type: BONUS_TYPE;
    private birthTime: number;
    private lifetime: number;

    public bonusSize: number = 0.12;

    constructor(scene: Scene, type: BONUS_TYPE, position: Vector3) {
        this.scene = scene;
        this.type = type;
        this.position = position;
        this.active = true;
        this.createModel().then(model => {
            this.mesh = model;
            this.scene.add(this.mesh);
        });
        this.birthTime = Date.now();
        this.lifetime = 10000;
    }

    async createModel(): Promise<THREE.Group> {
        const group = new THREE.Group();

        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        group.add(base);

        let symbol: THREE.Object3D;
        switch(this.type) {
            case BONUS_TYPE.STAR:
                const starModel = await ModelLoader.loadModel('../models/bonuses/star.glb');
                symbol = starModel;
                symbol.scale.set(this.bonusSize, this.bonusSize, this.bonusSize); // Масштабируем при необходимости
                break;

            case BONUS_TYPE.HELMET:
                const helmetModel = await ModelLoader.loadModel('../models/bonuses/helmet.glb');
                symbol = helmetModel;
                symbol.scale.set(this.bonusSize, this.bonusSize, this.bonusSize);
                break;

            case BONUS_TYPE.BOMB:
                const bombModel = await ModelLoader.loadModel('../models/bonuses/bomb.glb');
                symbol = bombModel;
                symbol.scale.set(this.bonusSize, this.bonusSize, this.bonusSize);
                break;

            case BONUS_TYPE.CLOCK:
                const clockModel = await ModelLoader.loadModel('../models/bonuses/clock.glb');
                symbol = clockModel;
                symbol.scale.set(this.bonusSize, this.bonusSize, this.bonusSize);
                break;

            case BONUS_TYPE.MACHINE_GUN:
                const machineGunModel = await ModelLoader.loadModel('../models/bonuses/machine_gun.glb');
                symbol = machineGunModel;
                symbol.scale.set(this.bonusSize, this.bonusSize, this.bonusSize);
                break;

            case BONUS_TYPE.SHIELD:
                const shieldGunModel = await ModelLoader.loadModel('../models/bonuses/shield.glb');
                symbol = shieldGunModel;
                symbol.scale.set(this.bonusSize, this.bonusSize, this.bonusSize);
                break;
        }

        symbol.position.y = 0.3;
        group.add(symbol);
        group.position.copy(this.position);

        return group;
    }

    update() {
        this.mesh.position.y = this.position.y + Math.sin(Date.now() * 0.005) * 0.2;
        this.mesh.rotation.y += 0.02;

        if (Date.now() - this.birthTime > this.lifetime) {
            this.active = false;
            this.scene.remove(this.mesh);
        }
    }

     async applyEffect(game) {
        switch(this.type) {
            case BONUS_TYPE.STAR:
                console.log("Star", game.playerLives)
                game.playerLives++;
                console.log("Star", game.playerLives)
                break;
            case BONUS_TYPE.HELMET:
                console.log("HELMET", game.playerTank.invulnerable)
                game.playerTank.invulnerable = true;
                console.log("HELMET", game.playerTank.invulnerable)

                setTimeout(() => {
                    game.playerTank.invulnerable = false;
                }, 10000);
                break;
            case BONUS_TYPE.BOMB:
                game.enemies.forEach(enemy => {
                    enemy.tankType.health = 0;
                    enemy.takeDamage();
                });
                game.enemiesDestroyed += game.enemies.length;
                game.enemies = [];
                break;
            case BONUS_TYPE.MACHINE_GUN:
                console.log("MACHINE_GUN", game.playerTank.tankType.shootCooldown)
                game.playerTank.tankType.shootCooldown = 300;
                console.log("MACHINE_GUN", game.playerTank.tankType.shootCooldown)
                setTimeout(() => {
                    game.playerTank.tankType.shootCooldown = 1000;
                }, 10000);
                break;
            case BONUS_TYPE.CLOCK:
                game.enemies.forEach(enemy => {
                    enemy.frozen = true;
                    setTimeout(() => {
                        enemy.frozen = false;
                    }, 5000);
                });

                console.log("CLOCK", game.enemies)

                break;
            case BONUS_TYPE.SHIELD:
                await game.gameField.addProtectionAroundHQ();
                break;
        }

        this.active = false;
        this.scene.remove(this.mesh);
    }
}