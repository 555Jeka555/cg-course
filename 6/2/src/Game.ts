import * as THREE from "three";
import {Vector3} from "three";
import {BLOCK_TYPE, GameField} from "./GameField.ts";
import {Tank} from "./Tank.ts";
import {Bullet, OWNER_TYPE} from "./Bullet.ts";
import {Effect} from "./Effect.ts";
import {Bonus, BONUS_TYPE} from "./Bonus.ts";
import {TankType} from "./TankType.ts";

export class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    static readonly FIELD_SIZE = 22;
    static readonly ENEMIES_TOTAL = 20;
    static readonly MAX_ENEMIES_ON_FIELD = 5;
    static readonly BONUS_CHANCE = 0.9;

    private enemiesDestroyed: number = 0;

    private gameOver: boolean = false;
    private levelCompleted: boolean = false;
    private gameField: GameField;
    private enemies: Tank[] = [];
    private bullets: Bullet[] = [];
    private effects: Effect[] = [];
    private bonuses: Bonus[] = [];

    private playerSpawnPosition = new Vector3(0, 0, 5 - Game.FIELD_SIZE / 2);
    private playerLives: number = 3;
    private playerTank: Tank;

    private basicTanksUrl: string[] = [
        '../models/tanks/basic_yellow_tank.glb',
        '../models/tanks/basic_green_tank.glb',
        '../models/tanks/basic_red_tank.glb',
        '../models/tanks/basic_gray_tank.glb',
    ]

    private fastTanksUrl: string[] = [
        '../models/tanks/fast_yellow_tank.glb',
        '../models/tanks/fast_green_tank.glb',
        '../models/tanks/fast_red_tank.glb',
        '../models/tanks/fast_gray_tank.glb',
    ]

    private armoredTanksUrl: string[] = [
        '../models/tanks/armored_yellow_tank.glb',
        '../models/tanks/armored_green_tank.glb',
        '../models/tanks/armored_red_tank.glb',
        '../models/tanks/armored_gray_tank.glb',
    ]

    private superTanksUrl: string[] = [
        '../models/tanks/super_yellow_tank.glb',
        '../models/tanks/super_green_tank.glb',
        '../models/tanks/super_red_tank.glb',
        '../models/tanks/super_gray_tank.glb',
    ]

    private playerTankType: TankType = new TankType(
        'player',
        2,
        1000,
        1,
        '../models/tanks/basic_yellow_tank.glb',
    );
    private enemiesTankType: TankType[] = [
        new TankType(
            'basic',
            1.9,
            1000,
            1,
            this.basicTanksUrl[Math.floor(Math.random() * this.basicTanksUrl.length)],
        ),
        new TankType(
            'fast',
            3,
            1500,
            1,
            this.fastTanksUrl[Math.floor(Math.random() * this.fastTanksUrl.length)],
        ),
        new TankType(
            'armored',
            1.5,
            2000,
            3,
            this.armoredTanksUrl[Math.floor(Math.random() * this.armoredTanksUrl.length)],
        ),
        new TankType(
            'super',
            1.5,
            2500,
            5,
            this.superTanksUrl[Math.floor(Math.random() * this.superTanksUrl.length)],
        ),
    ]

    private keys = {
        up: false,
        down: false,
        left: false,
        right: false,
        space: false
    };

    private audio = {
        shoot: new Audio('../sounds/shoot.mp3'),
        explosion: new Audio('../sounds/explosion.mp3'),
        bonus: new Audio('../sounds/bonus.mp3'),
        engine: new Audio('../sounds/engine.mp3')
    };

    constructor(
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
    ) {
        this.scene = scene;
        this.camera = camera;

        this.gameField = new GameField(Game.FIELD_SIZE, this.playerSpawnPosition);
        this.playerTank = new Tank(
            this.scene,
            this.playerTankType,
            this.playerSpawnPosition,
            true
        );

        this.scene.add(this.gameField.mesh);
        this.scene.add(this.playerTank.mesh);

        this.camera.position.set(0, 15, -13);
        this.camera.lookAt(0, 0, 0);

        this.setupControls();
        this.setupAudio();
    }

    setupControls() {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false
        };

        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    this.keys.up = true;
                    break;
                case 'ArrowDown':
                    this.keys.down = true;
                    break;
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'Space':
                    this.keys.space = true;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    this.keys.up = false;
                    break;
                case 'ArrowDown':
                    this.keys.down = false;
                    break;
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.space = false;
                    break;
            }
        });
    }

    setupAudio() {
        this.audio.engine.loop = true;
        this.audio.engine.volume = 0.3;
    }

    spawnEnemy() {
        if (this.enemies.length >= Game.MAX_ENEMIES_ON_FIELD ||
            this.enemiesDestroyed >= Game.ENEMIES_TOTAL) {
            return;
        }

        const spawnPoints = [
            new THREE.Vector3(-Game.FIELD_SIZE / 2 + 2, 0, Game.FIELD_SIZE / 2 - 2),
            new THREE.Vector3(Game.FIELD_SIZE / 2 - 2, 0, Game.FIELD_SIZE / 2 - 2),
            new THREE.Vector3(-Game.FIELD_SIZE / 2 + 2, 0, Game.FIELD_SIZE / 2 - 6),
            new THREE.Vector3(Game.FIELD_SIZE / 2 - 2, 0, Game.FIELD_SIZE / 2 - 6)
        ];

        const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

        const type = this.enemiesTankType[Math.floor(Math.random() * this.enemiesTankType.length)];

        const enemy = new Tank(this.scene, type, spawnPoint.clone());
        this.enemies.push(enemy);

        this.scene.add(enemy.mesh);
    }

    update(deltaTime: number) {
        if (this.gameOver || this.levelCompleted) return;

        this.checkBonusCollision();
        this.movePlayerMovement(deltaTime);
        this.playerShoot();
        this.updateEnemies(deltaTime);
        this.updateBullets(deltaTime);
        this.updateEffects();
        this.updateBonuses();
        this.checkWin();
    }

    checkBonusCollision() {
        const bonus = this.isPositionBonus(this.playerTank.position);
        if (bonus) {
            bonus.applyEffect(this);
            this.audio.bonus.play();
        }
    }

    movePlayerMovement(deltaTime: number) {
        const moveDirection = new THREE.Vector3();
        if (this.keys.up) moveDirection.z += 1;
        if (this.keys.down) moveDirection.z -= 1;
        if (this.keys.left) moveDirection.x += 1;
        if (this.keys.right) moveDirection.x -= 1;

        if (moveDirection.length() > 0) {
            const nextPosition = this.playerTank.position.clone().add(
                moveDirection.normalize().clone().multiplyScalar(this.playerTankType.speed * deltaTime)
            );

            if (!this.isPositionBlocked(nextPosition, this.playerTank.tankSize) && this.isPositionValid(nextPosition, this.playerTank.tankSize)) {
                this.playerTank.move(moveDirection.normalize(), deltaTime);
                if (!this.audio.engine.paused) this.audio.engine.play();
            }
        } else {
            this.audio.engine.pause();
        }
    }

    playerShoot() {
        if (this.keys.space) {
            const bullet = this.playerTank.shoot();
            if (bullet) {
                this.bullets.push(bullet);
                this.scene.add(bullet.mesh);
                this.audio.shoot.play();
            }
        }
    }

    updateEnemies(deltaTime: number) {
        this.enemies.forEach(enemy => {
            if (enemy.frozen) {
                return;
            }
            if (Math.random() < 0.01) {
                const directions = [
                    new THREE.Vector3(0, 0, -1),
                    new THREE.Vector3(0, 0, 1),
                    new THREE.Vector3(-1, 0, 0),
                    new THREE.Vector3(1, 0, 0)
                ];
                enemy.direction = directions[Math.floor(Math.random() * directions.length)];
            }

            const nextPosition = enemy.position.clone().add(
                enemy.direction.clone().multiplyScalar(enemy.tankType.speed * deltaTime)
            );

            if (!this.isPositionBlocked(nextPosition, enemy.tankSize) && this.isPositionValid(nextPosition, enemy.tankSize)) {
                enemy.move(enemy.direction.clone(), deltaTime);
            }

            if (Math.random() < 0.01) {
                const bullet = enemy.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                    this.scene.add(bullet.mesh);
                    this.audio.shoot.play();
                }
            }
        });

        if (Math.random() < 0.01) {
            this.spawnEnemy();
        }
    }

    updateBullets(deltaTime: number) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);

            if (this.checkBulletCollision(bullet)) {
                this.scene.remove(bullet.mesh);
                this.bullets.splice(i, 1);
            }
        }
    }

    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            if (this.effects[i].update()) {
                this.scene.remove(this.effects[i].mesh);
                this.effects.splice(i, 1);
            }
        }
    }

    updateBonuses() {
        this.bonuses.forEach(bonus => bonus.update());
        for (let i = this.bonuses.length - 1; i >= 0; i--) {
            if (!this.bonuses[i].active) {
                this.bonuses.splice(i, 1);
            }
        }
    }

    checkWin() {
        if (this.enemiesDestroyed >= Game.ENEMIES_TOTAL) {
            this.levelCompleted = true;
            alert('Level completed!');
        }
    }

    checkBulletCollision(bullet: Bullet) {
        if (Math.abs(bullet.position.x) > Game.FIELD_SIZE / 2 ||
            Math.abs(bullet.position.z) > Game.FIELD_SIZE / 2) {
            return true;
        }

        const gridX = Math.floor((bullet.position.x + Game.FIELD_SIZE / 2 - this.gameField.blockSize) / 2);
        const gridZ = Math.floor((bullet.position.z + Game.FIELD_SIZE / 2 - this.gameField.blockSize) / 2);

        if (gridX >= 0 && gridX < Game.FIELD_SIZE && gridZ >= 0 && gridZ < Game.FIELD_SIZE) {
            const block = this.gameField.grid[gridX][gridZ];
            if (block && block.userData) {
                switch (block.userData.type) {
                    case BLOCK_TYPE.BRICK:
                        block.userData.health--;
                        if (block.userData.health <= 0) {
                            this.gameField.mesh.remove(block);
                            this.scene.remove(block);
                            this.gameField.grid[gridX][gridZ] = null;
                        }
                        this.createExplosion(bullet.position);
                        return true;

                    case BLOCK_TYPE.TREE:
                        block.userData.health--;
                        if (block.userData.health <= 0) {
                            this.gameField.mesh.remove(block);
                            this.scene.remove(block);
                            this.gameField.grid[gridX][gridZ] = null;
                        }
                        this.createExplosion(bullet.position);
                        return true;

                    case BLOCK_TYPE.ARMOR:
                        this.createExplosion(bullet.position);
                        return true;

                    case BLOCK_TYPE.HEADQUARTERS:
                        block.userData.health--;
                        if (block.userData.health <= 0) {
                            this.gameOver = true;
                            alert('Game Over - HQ destroyed!');
                        }
                        this.createExplosion(bullet.position);
                        return true;
                }
            }
        }

        const bulletRadius = 0.1;
        const bulletBox = new THREE.Box3(
            new THREE.Vector3(
                bullet.position.x - bulletRadius,
                bullet.position.y - bulletRadius,
                bullet.position.z - bulletRadius
            ),
            new THREE.Vector3(
                bullet.position.x + bulletRadius,
                bullet.position.y + bulletRadius,
                bullet.position.z + bulletRadius
            )
        );

        if (bullet.owner === OWNER_TYPE.ENEMY) {
            const playerBox = new THREE.Box3().setFromObject(this.playerTank.mesh);
            if (bulletBox.intersectsBox(playerBox)) {
                if (!this.playerTank.invulnerable && this.playerTank.takeDamage()) {
                    this.playerLives--;
                    if (this.playerLives <= 0) {
                        this.gameOver = true;
                        alert('Game Over - No lives left!');
                    } else {
                        this.playerTank = new Tank(
                            this.scene,
                            this.playerTankType,
                            this.playerSpawnPosition,
                            true
                        );
                        this.scene.add(this.playerTank.mesh);
                    }
                }
                this.createExplosion(bullet.position);
                return true;
            }
        } else {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                const enemyBox = new THREE.Box3().setFromObject(enemy.mesh);
                if (bulletBox.intersectsBox(enemyBox)) {
                    if (enemy.takeDamage()) {
                        this.enemies.splice(i, 1);
                        this.enemiesDestroyed++;
                        let ran = Math.random();

                        if (ran < Game.BONUS_CHANCE) {
                            this.spawnBonus(enemy.position.clone());
                        }
                    }
                    this.createExplosion(bullet.position);
                    return true;
                }
            }
        }
    }

    spawnBonus(position: Vector3) {
        const bonusTypes = [
            BONUS_TYPE.STAR,
            BONUS_TYPE.HELMET,
            BONUS_TYPE.BOMB,
            BONUS_TYPE.MACHINE_GUN,
            BONUS_TYPE.CLOCK,
            BONUS_TYPE.SHIELD,
        ];
        const type = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        const positionBonus = new THREE.Vector3(
            Math.floor(position.x),
            position.y,
            Math.floor(position.z),
        );
        const bonus = new Bonus(this.scene, type, positionBonus);
        this.bonuses.push(bonus);
        if (this.gameField.grid[Math.floor(bonus.position.x)] === undefined) {
            this.gameField.grid[Math.floor(bonus.position.x)] = [];
        }
        this.gameField.grid[Math.floor(bonus.position.x)][Math.floor(bonus.position.z)] = bonus;
    }

    createExplosion(position) {
        const effect = new Effect(position);
        this.effects.push(effect);
        this.scene.add(effect.mesh);
        this.audio.explosion.currentTime = 0;
        this.audio.explosion.play();
    }

    isPositionBlocked(position: THREE.Vector3, tankSize: number): boolean {
        const halfSize = tankSize / 2;

        const checkPoints = [
            new THREE.Vector3(position.x - halfSize, 0, position.z - halfSize),
            new THREE.Vector3(position.x - halfSize, 0, position.z + halfSize),
            new THREE.Vector3(position.x + halfSize, 0, position.z - halfSize),
            new THREE.Vector3(position.x + halfSize, 0, position.z + halfSize)
        ];

        for (const point of checkPoints) {
            const gridX = Math.floor((point.x + Game.FIELD_SIZE / 2) / 2);
            const gridZ = Math.floor((point.z + Game.FIELD_SIZE / 2) / 2);

            if (
                gridX >= 0 && gridX < Game.FIELD_SIZE &&
                gridZ >= 0 && gridZ < Game.FIELD_SIZE
            ) {
                const block = this.gameField.grid[gridX][gridZ];
                if (block &&
                    block.userData &&
                    (block.userData.type === BLOCK_TYPE.BRICK ||
                        block.userData.type === BLOCK_TYPE.WATER ||
                        block.userData.type === BLOCK_TYPE.ARMOR ||
                        block.userData.type === BLOCK_TYPE.TREE
                    )
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    isPositionBonus(position: THREE.Vector3): Bonus | null {
        const detectionRadius = 1;

        for (const bonus of this.bonuses) {
            if (!bonus.active) continue;

            const distance = position.distanceTo(bonus.position);

            if (distance <= detectionRadius) {
                return bonus;
            }
        }

        return null;
    }

    isPositionValid(position: Vector3, tankSize: number): boolean {
        const minX = -Game.FIELD_SIZE / 2 + tankSize * 5;
        const maxX = Game.FIELD_SIZE / 2 - tankSize * 5;
        const minZ = -Game.FIELD_SIZE / 2 + tankSize * 5;
        const maxZ = Game.FIELD_SIZE / 2 - tankSize * 5;

        return position.x >= minX &&
            position.x <= maxX &&
            position.z >= minZ &&
            position.z <= maxZ;
    }
}