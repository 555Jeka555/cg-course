import {vec3} from 'gl-matrix'
import {Labyrinth} from './Labyrinth.ts'

enum Direction {
    Left,
    Right,
    Forward ,
    Backward ,
}

class Player {
    public position: vec3
    direction: number
    speed: number
    rotationSpeed: number

    constructor() {
        this.position = vec3.fromValues(1.5, 0.5, 1.5)
        this.direction = 0
        this.speed = 3
        this.rotationSpeed = 2
    }

    moveTo(labyrinth: Labyrinth, deltaTime: number, direction: Direction) {
        let xScale = 1
        let zScale = 1

        let xDiff = Math.cos(this.direction) * this.speed * deltaTime
        let zDiff = Math.sin(this.direction) * this.speed * deltaTime

        if (direction == Direction.Backward) {
            xScale = -1
            zScale = -1
        }

        if (direction == Direction.Left) {
            xScale = 1
            zScale = -1
            const temp = xDiff;
            xDiff = zDiff;
            zDiff = temp;
        }

        if (direction == Direction.Right) {
            xScale = -1
            zScale = 1
            const temp = xDiff;
            xDiff = zDiff;
            zDiff = temp;
        }


        const nextX = this.position[0] + xDiff * xScale
        const nextZ = this.position[2] + zDiff * zScale
        this.updatePosition(labyrinth, nextX, nextZ)
    }

    rotateTo(deltaTime: number, direction: Direction) {
        if (direction == Direction.Backward || direction == Direction.Forward) {
            return
        }
        let scale = 1
        if (direction == Direction.Left) {
            scale = -1
        }
        this.direction += this.rotationSpeed * deltaTime * scale
    }

    private updatePosition(labyrinth: Labyrinth, nextX: number, nextZ: number) {
        if (!labyrinth.isWall(nextX, nextZ)) {
            this.position[0] = nextX
            this.position[2] = nextZ
        }
        if (!labyrinth.isWall(this.position[0], nextZ)) {
            this.position[2] = nextZ
        }
        if (!labyrinth.isWall(nextX,  this.position[2])) {
            this.position[0] = nextX
        }
    }
}

export {
    Player,
    Direction
}