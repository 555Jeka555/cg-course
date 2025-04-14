import {mat4} from 'gl-matrix'

class Cube {
	private readonly positionBuffer: WebGLBuffer | null
	private readonly texCoordBuffer: WebGLBuffer | null
	private readonly indexBuffer: WebGLBuffer | null

	private readonly vertexPosition: number
	private readonly vertexTexCoord: number
	private readonly projectionMatrixLocation: WebGLUniformLocation | null
	private readonly modelViewMatrixLocation: WebGLUniformLocation | null
	private readonly samplerLocation: WebGLUniformLocation | null

	private indicesCount = 0

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly shaderProgram: WebGLProgram,
		private readonly texture: WebGLTexture,
		private readonly center: [number, number, number],
		private readonly size: number,
	) {
		const buffers = this.initBuffers()
		this.positionBuffer = buffers.position
		this.texCoordBuffer = buffers.texCoord
		this.indexBuffer = buffers.indices

		this.vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
		this.vertexTexCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord')
		this.projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix')
		this.modelViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
		this.samplerLocation = gl.getUniformLocation(shaderProgram, 'uSampler')
	}

	render(viewMatrix: mat4, projectionMatrix: mat4) {
		const gl = this.gl

		const modelMatrix = mat4.create()
		mat4.translate(modelMatrix, modelMatrix, this.center)

		const modelViewMatrix = mat4.create()
		mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix)

		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute.
		this.setPositionAttribute()

		this.setTexCoordAttribute()

		// Tell WebGL which indices to use to index the vertices
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

		// Tell WebGL to use our program when drawing
		gl.useProgram(this.shaderProgram)

		// Set the shader uniforms
		gl.uniformMatrix4fv(
			this.projectionMatrixLocation,
			false,
			projectionMatrix,
		)
		gl.uniformMatrix4fv(
			this.modelViewMatrixLocation,
			false,
			modelViewMatrix,
		)

		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.uniform1i(this.samplerLocation, 0)

		{
			const vertexCount = this.indicesCount
			const type = gl.UNSIGNED_SHORT
			const offset = 0
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
			gl.disableVertexAttribArray(this.vertexTexCoord)
		}
	}

	private setPositionAttribute() {
		const gl = this.gl
		const numComponents = 3
		const type = gl.FLOAT // the data in the buffer is 32bit floats
		const normalize = false // don't normalize
		const stride = 0 // how many bytes to get from one set of values to the next
		// 0 = use type and numComponents above
		const offset = 0 // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
		gl.vertexAttribPointer(
			this.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		)
		gl.enableVertexAttribArray(this.vertexPosition)
	}

	private setTexCoordAttribute() {
		const gl = this.gl
		if (this.vertexTexCoord < 0) {
			return
		}
		const numComponents = 2
		const type = gl.FLOAT
		const normalize = false
		const stride = 0
		const offset = 0
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
		gl.vertexAttribPointer(this.vertexTexCoord, numComponents, type, normalize, stride, offset)
		gl.enableVertexAttribArray(this.vertexTexCoord)
	}

	private initBuffers() {
		const positionBuffer = this.initPositionBuffer()
		const texCoordBuffer = this.initTexCoordBuffer()
		const indexBuffer = this.initIndexBuffer()

		return {
			position: positionBuffer,
			texCoord: texCoordBuffer,
			indices: indexBuffer,
		}
	}

	private initPositionBuffer(): WebGLBuffer | null {
		const gl = this.gl
		// Create a buffer for the square's positions.
		const positionBuffer = gl.createBuffer()

		// Select the positionBuffer as the one to apply buffer
		// operations to from here out.
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

		const positions = this.getPositions()

		for (let i = 2; i < positions.length; i += 3) {
			console.log((i - 2) / 3, [positions[i - 2], positions[i - 1], positions[i]])
		}

		// Now pass the list of positions into WebGL to build the
		// shape. We do this by creating a Float32Array from the
		// JavaScript array, then use it to fill the current buffer.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

		return positionBuffer
	}

	private initTexCoordBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const texCoordBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)

		const texCoords = [
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,

			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,

			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,

			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,

			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0,

			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,

		]
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW)
		return texCoordBuffer
	}

	private initIndexBuffer(): WebGLBuffer | null {
		const gl = this.gl

		const indexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

		// This array defines each face as two triangles, using the
		// indices into the vertex array to specify each triangle's
		// position.
		const triangleFaces = this.getTriangleFaces()

		const allFaces: number[][] = [...triangleFaces]
		// Преобразуем грани в массив индексов для отрисовки.
		// Для квадратов разобьём их на 2 треугольника.
		const indices: number[] = []
		for (const face of allFaces) {
			if (face.length === 3) {
				indices.push(...face)
			}
		}

		this.indicesCount = indices.length
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
		return indexBuffer
	}

	private getPositions(): number[] {
		const half = this.size / 2
		return [
			-half, -half, half,
			half, -half, half,
			half, half, half,
			-half, half, half,

			-half, -half, -half,
			-half, half, -half,
			half, half, -half,
			half, -half, -half,

			-half, half, -half,
			-half, half, half,
			half, half, half,
			half, half, -half,

			-half, -half, -half,
			half, -half, -half,
			half, -half, half,
			-half, -half, half,

			half, -half, -half,
			half, half, -half,
			half, half, half,
			half, -half, half,

			-half, -half, -half,
			-half, -half, half,
			-half, half, half,
			-half, half, -half,
		]
	}

	private getTriangleFaces(): number[][] {
		return [
			[0, 1, 2],
			[0, 2, 3],
			[4, 5, 6],
			[4, 6, 7],
			[8, 9, 10],
			[8, 10, 11],

			[12, 13, 14],
			[12, 14, 15],
			[16, 17, 18],
			[16, 18, 19],
			[20, 21, 22],
			[20, 22, 23],
		]
	}
}

export {
	Cube,
}