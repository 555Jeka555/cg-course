import {mat4, vec3} from 'gl-matrix'
import {loadTexture} from '../../common/WebGLUtils'
import {Cube} from './Cube'
import {Maze, WALL_TYPE} from './Maze'
import {Plane} from './Plane'

enum DIRECTION {
	FORWARD,
	BACKWARD,
	ROTATE_LEFT,
	ROTATE_RIGHT,
}

class Game {
	private floor?: Plane
	private maze?: Maze
	private skyBox?: Cube

	private cameraPos = vec3.fromValues(1, 0.5, 1)
	private cameraAngle = 0

	private moveSpeed = 0.025
	private turnSpeed = 0.015

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly shaderProgram: WebGLProgram,
	) {
		const grassTexturePromise = loadTexture(this.gl, '/textures/grass.jpg')
		const skyTexturePromise = loadTexture(this.gl, '/textures/sky.jpg')

		const brickWallTexturePromise = loadTexture(this.gl, '/textures/brick.jpg')
		const badWallTexturePromise = loadTexture(this.gl, '/textures/bad.jpg')
		const concreteWallTexturePromise = loadTexture(this.gl, '/textures/concrete.jpg')
		const stoneWallTexturePromise = loadTexture(this.gl, '/textures/stone.jpg')
		const whiteWallTexturePromise = loadTexture(this.gl, '/textures/white.jpg')
		const mouldWallTexturePromise = loadTexture(this.gl, '/textures/mould.jpg')

		Promise.all([grassTexturePromise, skyTexturePromise, brickWallTexturePromise, badWallTexturePromise, concreteWallTexturePromise, stoneWallTexturePromise, whiteWallTexturePromise, mouldWallTexturePromise])
			.then(([grassTexture, skyTexture, brickWallTexture, badWallTexture, concreteWallTexture, stoneWallTexture, whiteWallTexture, mouldWallTexture]) => {
				const maze = new Maze(this.gl, this.shaderProgram, {
					[WALL_TYPE.EMPTY]: brickWallTexture,
					[WALL_TYPE.BRICK]: brickWallTexture,
					[WALL_TYPE.BAD]: badWallTexture,
					[WALL_TYPE.CONCRETE]: concreteWallTexture,
					[WALL_TYPE.STONE]: stoneWallTexture,
					[WALL_TYPE.WHITE]: whiteWallTexture,
					[WALL_TYPE.MOULD]: mouldWallTexture,
				})
				this.maze = maze
				const centerX = (maze.getSize().mazeSize * maze.getSize().cellSize) / 2
				const centerZ = (maze.getSize().mazeSize * maze.getSize().cellSize) / 2

				this.floor = new Plane(this.gl, this.shaderProgram, grassTexture, [centerX, 0, centerZ], maze.getSize().mazeSize * maze.getSize().cellSize, 'bottom')
				this.skyBox = new Cube(this.gl, this.shaderProgram, skyTexture, [centerX, 0, centerZ], 100)
			})
	}

	render() {
		const gl = this.gl
		gl.clearColor(0.0, 0.0, 0.0, 1.0)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		gl.enable(gl.DEPTH_TEST)
		gl.depthFunc(gl.LEQUAL)

		const fieldOfView = (45 * Math.PI) / 180
		const aspect = gl.canvas.width / gl.canvas.height
		const zNear = 0.1
		const zFar = 100.0
		const projectionMatrix = mat4.create()
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

		const center = vec3.fromValues(
			this.cameraPos[0] + Math.sin(this.cameraAngle),
			this.cameraPos[1],
			this.cameraPos[2] + Math.cos(this.cameraAngle),
		)
		const up = vec3.fromValues(0, 1, 0)
		const viewMatrix = mat4.create()
		mat4.lookAt(viewMatrix, this.cameraPos, center, up)

		this.floor?.render(viewMatrix, projectionMatrix)
		this.skyBox?.render(viewMatrix, projectionMatrix)
		this.maze?.render(viewMatrix, projectionMatrix)
	}

	move(direction: DIRECTION) {
		const newPos = vec3.clone(this.cameraPos)

		switch (direction) {
			case DIRECTION.FORWARD:
				newPos[0] += Math.sin(this.cameraAngle) * this.moveSpeed
				newPos[2] += Math.cos(this.cameraAngle) * this.moveSpeed
				break
			case DIRECTION.BACKWARD:
				newPos[0] -= Math.sin(this.cameraAngle) * this.moveSpeed
				newPos[2] -= Math.cos(this.cameraAngle) * this.moveSpeed
				break
			case DIRECTION.ROTATE_LEFT:
				this.cameraAngle += this.turnSpeed
				return
			case DIRECTION.ROTATE_RIGHT:
				this.cameraAngle -= this.turnSpeed
				return
		}

		if (this.canMoveTo(newPos)) {
			this.cameraPos = newPos
		}
	}

	private canMoveTo(newPos: vec3): boolean {
		if (!this.maze) {
			return false
		}
		const cellX = Math.floor(newPos[0])
		const cellZ = Math.floor(newPos[2])
		const mazeSize = this.maze.getSize().mazeSize

		if (cellX < 0 || cellX >= mazeSize || cellZ < 0 || cellZ >= mazeSize) {
			return false
		}

		return this.maze.isWalkable(cellX, cellZ)
	}
}

export {
	DIRECTION,
	Game,
}
