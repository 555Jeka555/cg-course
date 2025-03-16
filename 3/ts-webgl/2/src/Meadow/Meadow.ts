import {Color, Renderable} from '../types'
import {getWorldSize} from '../Utils.ts'

class Meadow implements Renderable {
	private patches: {vertices: Float32Array, color: Color}[] = []

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		this.initPatches()
	}


	render() {
		const gl = this.gl
		const posLoc = gl.getAttribLocation(this.program, 'position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')
		for (const patch of this.patches) {
			const buffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
			gl.bufferData(gl.ARRAY_BUFFER, patch.vertices, gl.STATIC_DRAW)
			gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
			gl.enableVertexAttribArray(posLoc)
			gl.uniform4f(colorLoc, patch.color.r, patch.color.g, patch.color.b, patch.color.a)
			gl.drawArrays(gl.TRIANGLES, 0, patch.vertices.length / 2)
			gl.deleteBuffer(buffer)
		}
	}

	update(): void {
	}

	private initPatches() {
		const {width, height} = getWorldSize()
		const [left, right, bottom] = [-width / 2, width / 2, -height / 2]
		const patchesInfo = [
			{x1: left, x2: left / 2, color: {r: 0.2, g: 0.8, b: 0.2, a: 1}},
			{x1: left / 2, x2: 0, color: {r: 0.1, g: 0.7, b: 0.1, a: 1}},
			{x1: 0, x2: right / 2, color: {r: 0.3, g: 0.85, b: 0.3, a: 1}},
			{x1: right / 2, x2: right, color: {r: 0.15, g: 0.75, b: 0.15, a: 1}},
		]
		for (const patch of patchesInfo) {
			const {x1, x2, color} = patch
			const vertices = new Float32Array([
				x1, bottom,
				x2, bottom,
				x1, 0,
				x1, 0,
				x2, bottom,
				x2, 0,
			])
			this.patches.push({vertices, color})
		}
	}
}

export {
	Meadow,
}
