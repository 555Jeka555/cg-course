import {Position, Renderable} from '../types'
import {getWorldSize} from '../Utils.ts'

class Moon implements Renderable {
	private buffer: WebGLBuffer | null = null
	private radius = 0.8
	private segments = 30

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
		private position: Position,
	) {
		this.buffer = this.gl.createBuffer()
	}

	render() {
		const gl = this.gl
		const posLoc = gl.getAttribLocation(this.program, 'position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
		const vertices = this.getVertices()
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(posLoc)
		gl.uniform4f(colorLoc, 0.9, 0.9, 0.7, 1)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2)
	}

	update() {
		const {height} = getWorldSize()
		const [top, bottom] = [height / 2, -height / 2]

		this.position.y += 0.002
		if (this.position.y > top) {
			this.position.y = bottom
		}
	}

	private getVertices() {
		const vertices: number[] = []
		vertices.push(this.position.x, this.position.y)
		for (let i = 0; i <= this.segments; i++) {
			const angle = (i / this.segments) * 2 * Math.PI
			vertices.push(this.position.x + this.radius * Math.cos(angle), this.position.y + this.radius * Math.sin(angle))
		}
		return vertices
	}
}

export {
	Moon,
}