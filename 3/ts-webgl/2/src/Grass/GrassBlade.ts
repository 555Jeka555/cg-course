import {Position, Renderable} from '../types'

type GrassBladeData = {
	firstAngle: Position,
	secondAngle: Position,
	thirdAngle: Position,
}

class GrassBlade implements Renderable {
	private buffer: WebGLBuffer | null = null
	private vertexCount = 0

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
		private readonly data: GrassBladeData,
	) {
		this.initBuffer()
	}

	render() {
		const gl = this.gl
		const posLoc = gl.getAttribLocation(this.program, 'position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(posLoc)
		gl.uniform4f(colorLoc, 0.0, 0.6, 0.0, 1.0)
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount)
	}

	update() {
	}

	private initBuffer() {
		this.buffer = this.gl.createBuffer()
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
		const vertices = this.getVertices()
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(vertices),
			this.gl.STATIC_DRAW,
		)
		this.vertexCount = vertices.length / 2
	}

	private getVertices() {
		const grassVertices = [
			this.data.firstAngle.x, this.data.firstAngle.y,
			this.data.secondAngle.x, this.data.secondAngle.y,
			this.data.thirdAngle.x, this.data.thirdAngle.y,
		]
		return new Float32Array(grassVertices)
	}
}

export {
	GrassBlade,
}