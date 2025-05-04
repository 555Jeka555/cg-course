import * as THREE from "three";
import {ModelLoader} from "./ModelLoader.ts";

export class GameField {
    public grid = [];
    public mesh: THREE.Group;

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


    constructor(size: number) {
        this.size = size;
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

        // Генерация случайного ландшафта
        for (let x = 0; x < this.size; x++) {
            this.grid[x] = [];
            for (let z = 0; z < this.size; z++) {
                // Логика генерации блоков
                if (Math.random() < 0.05) {
                    this.addBlock(x, z, this.BLOCK_TYPES.BRICK);
                } else if (Math.random() < 0.03) {
                    this.addBlock(x, z, this.BLOCK_TYPES.WATER);
                } else if (Math.random() < 0.02) {
                    this.addBlock(x, z, this.BLOCK_TYPES.ARMOR);
                }
            }
        }

        // Добавление штаба
        this.addHeadquarters();
    }

    async addBlock(x: number, z: number, type) {
        // Реализация добавления различных блоков
        let block;
        const blockSize = 0.1;
        const height = 0.1;

        switch(type) {
            case this.BLOCK_TYPES.BRICK:
                block = await ModelLoader.loadModel('../models/blocks/brick_wall.glb');

                // Настраиваем масштаб и позицию
                block.scale.set(blockSize, height, blockSize);
                block.position.set(x - this.size/2, height * 4, z - this.size/2);

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

                // Настраиваем масштаб и позицию
                block.scale.set(blockSize, height, blockSize);
                block.position.set(x - this.size/2, height/2, z - this.size/2);

                block.userData = { type: 'WATER' };

                this.mesh.add(block);
                this.grid[x][z] = block;
                break;

            // Аналогично для других типов блоков
        }
    }

    async addHeadquarters() {
        // Создание модели штаба
        this.headquarters = await ModelLoader.loadModel('../models/headquarters.glb');

        this.headquarters.scale.set(0.1, 0.1, 0.1);

        this.headquarters.position.set(0, 0.75, this.size/2 - 2);
        this.headquarters.userData = { type: 'HEADQUARTERS', health: 1 };
        this.mesh.add(this.headquarters);

        // Защита вокруг штаба
        this.addProtectionAroundHQ();
    }

    addProtectionAroundHQ() {
        // Реализация защиты штаба (бронированные и кирпичные стены)
    }
}