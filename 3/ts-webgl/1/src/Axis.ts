export class Axis {
	private axesBuffer: WebGLBuffer | null = null
	private ticksBuffer: WebGLBuffer | null = null
	private arrowBuffer: WebGLBuffer | null = null

	private axesVertexCount = 0
	private ticksVertexCount = 0
	private arrowVertexCount = 0

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		this.initBuffers()
	}

	render() {
		const gl = this.gl
		const positionLocation = gl.getAttribLocation(this.program, 'position')
		const colorLocation = gl.getUniformLocation(this.program, 'u_color')

		gl.uniform4f(colorLocation, 1, 0, 0, 1)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.axesBuffer)
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(positionLocation)
		gl.drawArrays(gl.LINES, 0, 2)

		gl.uniform4f(colorLocation, 0, 0, 1, 1)
		gl.drawArrays(gl.LINES, 2, 2)

		gl.uniform4f(colorLocation, 0, 1, 0, 1)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.ticksBuffer)
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(positionLocation)
		gl.drawArrays(gl.LINES, 0, this.ticksVertexCount)

		gl.uniform4f(colorLocation, 0, 1, 0, 1)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.arrowBuffer)
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(positionLocation)
		gl.drawArrays(gl.TRIANGLES, 0, this.arrowVertexCount)
	}

	private initBuffers() {
		const gl = this.gl

		const axesVertices = new Float32Array([
			-5, 0, 5, 0,
			0, -10, 0, 10,
		])
		this.axesVertexCount = axesVertices.length / 2
		this.axesBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.axesBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW)

		const tickSize = 0.2
		const xTicks: number[] = []
		for (let x = -5; x <= 5; x += 1) {
			xTicks.push(x, -tickSize, x, tickSize)
		}
		const yTicks: number[] = []
		for (let y = -10; y <= 10; y += 1) {
			yTicks.push(-tickSize, y, tickSize, y)
		}
		const ticksVertices = new Float32Array([...xTicks, ...yTicks])
		this.ticksVertexCount = ticksVertices.length / 2
		this.ticksBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.ticksBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, ticksVertices, gl.STATIC_DRAW)

		const arrowX = [
			5, 0,
			4.8, 0.1,
			4.8, -0.1,
		]
		const arrowY = [
			0, 10,
			0.1, 9.8,
			-0.1, 9.8,
		]
		const arrowVertices = new Float32Array([...arrowX, ...arrowY])
		this.arrowVertexCount = arrowVertices.length / 2
		this.arrowBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.arrowBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, arrowVertices, gl.STATIC_DRAW)
	}
}