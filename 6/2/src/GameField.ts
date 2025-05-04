import * as THREE from "three";
import {ModelLoader} from "./ModelLoader.ts";
import {Vector3} from "three";

export class GameField {
    public grid = [];
    public mesh: THREE.Group;

    private playerPosition: Vector3;
    private size: number;
    private headquarters;
    private BLOCK_TYPES = {
        GROUND: 0,
        BRICK: 1,
        WATER: 2,
        ARMOR: 3,
        ICE: 4,
        TREE: 5
    };

    public blockSize: number = 0.12;

    constructor(size: number, playerPosition: Vector3) {
        this.size = size;
        this.playerPosition = playerPosition;
        this.mesh = new THREE.Group();

        this.createField();
    }

    createField() {
        // Создание текстуры земли
        const groundTexture = new THREE.TextureLoader().load('../textures/grass.jpg');
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(this.size / 2, this.size / 2);

        // Создание плоскости земли
        const groundGeometry = new THREE.PlaneGeometry(this.size, this.size);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        this.mesh.add(ground);

        for (let x = 0; x < this.size; x++) {
            this.grid[x] = [];
        }

        this.addHeadquarters();

        for (let x = 0; x < this.size / 2 - 1; x++) {
            for (let z = 0; z < this.size / 2 - 1; z++) {
                if (Math.random() < 0.2) {
                    this.addBlock(x, z, this.BLOCK_TYPES.BRICK);
                } else if (Math.random() < 0.18) {
                    this.addBlock(x, z, this.BLOCK_TYPES.WATER);
                } else if (Math.random() < 0.16) {
                    this.addBlock(x, z, this.BLOCK_TYPES.ARMOR);
                }
            }
        }
    }

    async addBlock(x: number, z: number, type) {
        if (this.grid[x][z] !== undefined) {
            return;
        }

        const xPos = x * 2 + 1;
        const zPos = z * 2 + 1;

        if (xPos - this.size/2 === this.playerPosition.x && zPos - this.size/2 === this.playerPosition.z) {
            return;
        }

        // Реализация добавления различных блоков
        let block;

        switch(type) {
            case this.BLOCK_TYPES.BRICK:
                block = await ModelLoader.loadModel('../models/blocks/brick_wall.glb');

                // Настраиваем масштаб и позицию
                block.scale.set(this.blockSize, this.blockSize, this.blockSize);
                block.position.set(xPos - this.size/2, this.blockSize * 4, zPos - this.size/2);

                // Добавляем пользовательские данные
                block.userData = {
                    type: 'BRICK',
                    health: 3,
                    originalPosition: block.position.clone()
                };

                this.mesh.add(block);
                this.grid[x][z] = block;

                break;

            case this.BLOCK_TYPES.WATER:
                block = await ModelLoader.loadModel('../models/blocks/water.glb');

                block.scale.set(this.blockSize, this.blockSize, this.blockSize);
                block.position.set(xPos - this.size/2, this.blockSize/2, zPos - this.size/2);

                block.userData = { type: 'WATER' };

                this.mesh.add(block);
                this.grid[x][z] = block;
                break;
        }
    }

    async addHeadquarters() {
        this.headquarters = await ModelLoader.loadModel('../models/headquarters.glb');

        this.headquarters.scale.set(0.1, 0.1, 0.1);

        this.headquarters.position.set(0, 0.75, 1 - this.size / 2);
        this.headquarters.userData = { type: 'HEADQUARTERS', health: 1 };
        this.mesh.add(this.headquarters);

        this.addProtectionAroundHQ();
    }

    addProtectionAroundHQ() {
        this.addBlock(4, 0, this.BLOCK_TYPES.BRICK);
        this.addBlock(4, 1, this.BLOCK_TYPES.BRICK);
        this.addBlock(5, 1, this.BLOCK_TYPES.BRICK);
        this.addBlock(6, 1, this.BLOCK_TYPES.BRICK);
        this.addBlock(6, 0, this.BLOCK_TYPES.BRICK);
    }
}