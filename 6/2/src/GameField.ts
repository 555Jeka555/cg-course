import * as THREE from "three";
import {ModelLoader} from "./ModelLoader.ts";
import {Vector3} from "three";

export enum BLOCK_TYPE {
    BRICK,
    WATER,
    ARMOR,
    TREE,
    HEADQUARTERS,
}

export class GameField {
    public grid = [];
    public mesh: THREE.Group;

    private playerPosition: Vector3;
    private size: number;
    private headquarters;

    public blockSize: number = 0.12;

    constructor(size: number, playerPosition: Vector3) {
        this.size = size;
        this.playerPosition = playerPosition;
        this.mesh = new THREE.Group();

        this.createField();
    }

    async createField() {
        const groundTexture = new THREE.TextureLoader().load('../textures/grass.jpg');
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(this.size / 2, this.size / 2);

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

        await this.addHeadquarters();

        for (let x = 0; x < this.size / 2 - 1; x++) {
            for (let z = 0; z < this.size / 2 - 1; z++) {
                if (Math.random() < 0.18) {
                    this.addBlock(x, z, BLOCK_TYPE.BRICK);
                } else if (Math.random() < 0.14) {
                    this.addBlock(x, z, BLOCK_TYPE.WATER);
                } else if (Math.random() < 0.12) {
                    this.addBlock(x, z, BLOCK_TYPE.ARMOR);
                }
                else if (Math.random() < 0.2) {
                    this.addBlock(x, z, BLOCK_TYPE.TREE);
                }
            }
        }
    }

    async addHeadquarters() {
        this.headquarters = await ModelLoader.loadModel('../models/headquarters.glb');

        this.headquarters.scale.set(0.1, 0.1, 0.1);

        this.headquarters.position.set(0, 0.75, 1 - this.size / 2);
        this.headquarters.userData = { type: BLOCK_TYPE.HEADQUARTERS, health: 1 };
        this.mesh.add(this.headquarters);
        this.grid[5][0] = this.headquarters;

        await this.addProtectionAroundHQ();
    }

    public async addProtectionAroundHQ() {
        await this.addBlock(4, 0, BLOCK_TYPE.BRICK);
        await this.addBlock(4, 1, BLOCK_TYPE.BRICK);
        await this.addBlock(5, 1, BLOCK_TYPE.BRICK);
        await this.addBlock(6, 1, BLOCK_TYPE.BRICK);
        await this.addBlock(6, 0, BLOCK_TYPE.BRICK);
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

        let block;
        switch(type) {
            case BLOCK_TYPE.BRICK:
                block = await ModelLoader.loadModel('../models/blocks/brick_wall.glb');

                block.scale.set(this.blockSize, this.blockSize, this.blockSize);
                block.position.set(xPos - this.size/2, this.blockSize * 8, zPos - this.size/2);

                block.userData = {
                    type: BLOCK_TYPE.BRICK,
                    health: 3,
                    originalPosition: block.position.clone()
                };

                this.mesh.add(block);
                this.grid[x][z] = block;

                break;

            case BLOCK_TYPE.WATER:
                block = await ModelLoader.loadModel('../models/blocks/water.glb');

                block.scale.set(this.blockSize, this.blockSize, this.blockSize);
                block.position.set(xPos - this.size/2, this.blockSize/2, zPos - this.size/2);

                block.userData = { type: BLOCK_TYPE.WATER };

                this.mesh.add(block);
                this.grid[x][z] = block;
                break;

            case BLOCK_TYPE.ARMOR:
                block = await ModelLoader.loadModel('../models/blocks/armor.glb');

                block.scale.set(this.blockSize, this.blockSize, this.blockSize);
                block.position.set(xPos - this.size/2, this.blockSize * 8, zPos - this.size/2);

                block.userData = { type: BLOCK_TYPE.ARMOR };

                this.mesh.add(block);
                this.grid[x][z] = block;
                break;
            case BLOCK_TYPE.TREE:
                block = await ModelLoader.loadModel('../models/blocks/tree.glb');

                block.scale.set(this.blockSize, this.blockSize, this.blockSize);
                block.position.set(xPos - this.size/2, this.blockSize * 8, zPos - this.size/2);

                block.userData = {
                    type: BLOCK_TYPE.TREE,
                    health: 1,
                    originalPosition: block.position.clone()
                };

                this.mesh.add(block);
                this.grid[x][z] = block;
                break;
        }
    }
}