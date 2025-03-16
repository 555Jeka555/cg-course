import {Renderable} from '../types'
import {getWorldSize} from '../Utils.ts'

class Stars implements Renderable {
	private vertexCount = 0
	private buffer: WebGLBuffer | null = null

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		this.initStars()
	}

	render() {
		const gl = this.gl
		const posLoc = gl.getAttribLocation(this.program, 'position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(posLoc)
		gl.uniform4f(colorLoc, 1, 1, 1, 1)
		gl.drawArrays(gl.POINTS, 0, this.vertexCount)
	}

	update() {
	}

	private initStars() {
		const {width, height} = getWorldSize()

		const stars: number[] = []

		for (let i = 0; i < 300; i++) {
			const x = Math.random() * width - width / 2
			const y = Math.random() * (height / 2)
			stars.push(x, y)
		}

		const starPositions = new Float32Array(stars)
		this.vertexCount = starPositions.length / 2
		this.buffer = this.gl.createBuffer()
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, starPositions, this.gl.STATIC_DRAW)
	}
}

export {
	Stars,
}
