import * as THREE from "three";
import {Scene, Vector3} from "three";
import {Tank} from "./Tank.ts";
import {ModelLoader} from "./ModelLoader.ts";

export class Bonus {
    public position: Vector3;
    public mesh: THREE.Group = new THREE.Group();
    public active: boolean;

    private scene: Scene;
    private type: string;
    private birthTime: number;
    private lifetime: number;
    private enemies: Tank[] = [];

    constructor(scene: Scene, type: string, position: Vector3, enemies: Tank[]) {
        this.scene = scene;
        this.type = type;
        this.position = position;
        this.active = true;
        this.createModel().then(model => {
            this.mesh = model;
        });
        this.birthTime = Date.now();
        this.lifetime = 10000;
        this.enemies = enemies;
    }

    async createModel(): Promise<THREE.Group> {
        const group = new THREE.Group();

        // Основание бонуса (синхронная часть)
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        group.add(base);

        // Символ бонуса (асинхронная часть)
        let symbol: THREE.Object3D;
        switch(this.type) {
            case 'STAR':
                try {
                    const starModel = await ModelLoader.loadModel('../models/bonuses/star.glb');
                    symbol = starModel;
                    symbol.scale.set(0.3, 0.3, 0.3); // Масштабируем при необходимости
                } catch (error) {
                    console.error('Failed to load star model, using fallback:', error);
                    // Фолбэк на простую геометрию
                    const starGeometry = new THREE.TetrahedronGeometry(0.3);
                    const starMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
                    symbol = new THREE.Mesh(starGeometry, starMaterial);
                }
                break;

            case 'HELMET':
                try {
                    const helmetModel = await ModelLoader.loadModel('../models/bonuses/helmet.glb');
                    symbol = helmetModel;
                    symbol.scale.set(0.3, 0.3, 0.3);
                } catch (error) {
                    console.error('Failed to load helmet model, using fallback:', error);
                    // Фолбэк на сферу
                    const helmetGeometry = new THREE.SphereGeometry(0.3);
                    const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
                    symbol = new THREE.Mesh(helmetGeometry, helmetMaterial);
                }
                break;

            default:
                // Дефолтный символ
                const defaultGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                symbol = new THREE.Mesh(defaultGeometry, defaultMaterial);
        }

        // Позиционируем символ
        symbol.position.y = 0.3;
        group.add(symbol);

        // Позиционируем всю группу
        group.position.copy(this.position);

        return group;
    }

    update() {
        // Анимация парения
        this.mesh.position.y = this.position.y + Math.sin(Date.now() * 0.005) * 0.2;
        this.mesh.rotation.y += 0.02;

        // Проверка времени жизни
        if (Date.now() - this.birthTime > this.lifetime) {
            this.active = false;
            this.scene.remove(this.mesh);
        }
    }

    applyEffect(game) {
        switch(this.type) {
            case 'STAR':
                game.playerLives++;
                break;
            case 'HELMET':
                game.playerTank.invulnerable = true;
                setTimeout(() => {
                    game.playerTank.invulnerable = false;
                }, 10000);
                break;
            case 'BOMB':
                this.enemies.forEach(enemy => {
                    enemy.tankType.health = 0;
                    enemy.takeDamage();
                });
                break;
            case 'MACHINE_GUN':
                game.playerTank.shootCooldown = 300;
                setTimeout(() => {
                    game.playerTank.shootCooldown = 1000;
                }, 10000);
                break;
            case 'CLOCK':
                this.enemies.forEach(enemy => {
                    enemy.frozen = true;
                    setTimeout(() => {
                        enemy.frozen = false;
                    }, 5000);
                });
                break;
        }

        this.active = false;
        this.scene.remove(this.mesh);
    }
}