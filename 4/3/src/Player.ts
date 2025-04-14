import {vec3} from 'gl-matrix'
import {Labyrinth} from './Labyrinth.ts'

export class Player {
    position: vec3
    direction: number
    pitch: number
    speed: number
    rotationSpeed: number
    y: number = 2.5

    constructor() {
        this.position = vec3.fromValues(1.5, this.y, 1.5)
        this.direction = 0
        this.pitch = 0;
        this.speed = 1
        this.rotationSpeed = 1.5
    }

    moveForward(labyrinth: Labyrinth, deltaTime: number) {
        const nextX = this.position[0] + Math.cos(this.direction) * this.speed * deltaTime
        const nextZ = this.position[2] + Math.sin(this.direction) * this.speed * deltaTime
        this.updatePosition(labyrinth, nextX, nextZ)
    }

    rotate(deltaTime: number) {
        this.direction += this.rotationSpeed * deltaTime
    }

    setPitch(pitch: number) {
        this.pitch += pitch
        this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
    }

    private updatePosition(labyrinth: Labyrinth, nextX: number, nextZ: number) {
        if (!labyrinth.isWall(nextX, this.y, nextZ)) {
            this.position[0] = nextX
            this.position[2] = nextZ
        }
    }
}
