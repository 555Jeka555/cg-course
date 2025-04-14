import {mat4} from 'gl-matrix'
import {Cube} from './Cube'

enum WALL_TYPE {
	EMPTY = 0,
	BRICK,
	BAD,
	CONCRETE,
	STONE,
	WHITE,
	MOULD,
}

class Maze {
	private maze: WALL_TYPE[][] = []
	private cubes: Cube[] = []
	private readonly MAZE_SIZE = 16
	private readonly CELL_SIZE = 1.0

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly shaderProgram: WebGLProgram,
		private readonly textures: Record<WALL_TYPE, WebGLTexture>,
	) {
		this.generateMaze()
		this.initCubes()
	}

	render(viewMatrix: mat4, projectionMatrix: mat4) {
		for (const cube of this.cubes) {
			cube.render(viewMatrix, projectionMatrix)
		}
	}

	getSize() {
		return {
			cellSize: this.CELL_SIZE,
			mazeSize: this.MAZE_SIZE,
		}
	}

	isWalkable(x: number, z: number): boolean {
		// @ts-expect-error
		return this.maze[z][x] === 0
	}

	private generateMaze() {
		const empty = WALL_TYPE.EMPTY
		const brick = WALL_TYPE.BRICK
		const bad = WALL_TYPE.BAD
		const concrete = WALL_TYPE.CONCRETE
		const stone = WALL_TYPE.STONE
		const white = WALL_TYPE.WHITE
		const mould = WALL_TYPE.MOULD

		this.maze = [
			[brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick],
			[brick, empty, empty, empty, empty, empty, empty, concrete, empty, empty, white, empty, white, empty, white, brick],
			[brick, empty, bad, bad, empty, concrete, empty, white, empty, empty, white, empty, white, empty, white, brick],
			[brick, empty, bad, empty, empty, concrete, empty, white, empty, empty, white, empty, white, empty, white, brick],
			[brick, empty, bad, concrete, stone, concrete, empty, white, empty, empty, empty, empty, empty, empty, empty, brick],
			[brick, empty, empty, empty, empty, empty, empty, stone, empty, concrete, empty, concrete, empty, concrete, empty, brick],
			[brick, empty, mould, mould, empty, mould, mould, stone, empty, concrete, empty, concrete, empty, concrete, empty, brick],
			[brick, empty, mould, empty, empty, mould, empty, stone, empty, concrete, empty, concrete, empty, concrete, empty, brick],
			[brick, empty, mould, mould, empty, mould, empty, stone, empty, empty, empty, empty, empty, empty, empty, brick],
			[brick, empty, empty, empty, empty, empty, empty, stone, empty, empty, stone, empty, concrete, empty, concrete, brick],
			[brick, mould, mould, mould, mould, mould, empty, stone, empty, empty, concrete, empty, concrete, empty, concrete, brick],
			[brick, empty, empty, empty, empty, empty, empty, stone, empty, empty, bad, empty, bad, empty, bad, brick],
			[brick, empty, white, white, empty, white, white, stone, empty, empty, empty, empty, empty, empty, empty, brick],
			[brick, empty, white, white, empty, white, empty, stone, empty, white, empty, bad, empty, bad, empty, brick],
			[brick, empty, empty, white, empty, empty, empty, empty, empty, white, empty, white, empty, white, empty, brick],
			[brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick, brick],
		]
	}

	private initCubes() {
		for (let i = 0; i < this.MAZE_SIZE; i++) {
			for (let j = 0; j < this.MAZE_SIZE; j++) {
				// @ts-expect-error
				const type = this.maze[i][j]
				if (type !== undefined && type !== WALL_TYPE.EMPTY) {
					const x = j * this.CELL_SIZE + this.CELL_SIZE / 2
					const z = i * this.CELL_SIZE + this.CELL_SIZE / 2
					const y = 0.5
					const cube = new Cube(this.gl, this.shaderProgram, this.textures[type], [x, y, z], this.CELL_SIZE)
					this.cubes.push(cube)
				}
			}
		}
	}
}

export {
	WALL_TYPE,
	Maze,
}
