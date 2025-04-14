import {mat3, mat4, ReadonlyVec3, vec3} from 'gl-matrix'

class DeltoidalIcositetrahedron {
	private readonly positionBuffer: WebGLBuffer | null
	private readonly colorBuffer: WebGLBuffer | null
	private readonly edgeBuffer: WebGLBuffer | null
	private readonly indexBuffer: WebGLBuffer | null
	private readonly normalBuffer: WebGLBuffer | null

	private readonly vertexPosition: number
	private readonly vertexColor: number
	private readonly projectionMatrix: WebGLUniformLocation | null
	private readonly modelViewMatrix: WebGLUniformLocation | null
	private readonly normalMatrixLocation: WebGLUniformLocation | null
	private readonly normalLocation: number

	private readonly reverseLightDirection: WebGLUniformLocation | null

	private edgeCount = 0
	private indexCount = 0
	private positions: number[] = []

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly shaderProgram: WebGLProgram,
	) {
		const buffers = this.initBuffers()
		this.positionBuffer = buffers.position
		this.colorBuffer = buffers.color
		this.indexBuffer = buffers.indices
		this.edgeBuffer = buffers.edges
		this.normalBuffer = buffers.normal

		this.vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
		this.vertexColor = gl.getAttribLocation(shaderProgram, 'aVertexColor')
		this.projectionMatrix = gl.getUniformLocation(
			shaderProgram,
			'uProjectionMatrix',
		)
		this.modelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
		this.normalLocation = gl.getAttribLocation(shaderProgram, 'aNormal')
		this.normalMatrixLocation = gl.getUniformLocation(shaderProgram, 'uNormalMatrix')

		this.reverseLightDirection = gl.getUniformLocation(shaderProgram, 'uReverseLightDirection')
	}

	render(cameraRotationX: number, cameraRotationY: number, lightIntensity: number) {
		const gl = this.gl
		gl.clearColor(0.0, 0.0, 0.0, 0.1) // Clear to black, fully opaque
		gl.clearDepth(1.0) // Clear everything
		gl.enable(gl.DEPTH_TEST) // Enable depth testing
		gl.depthFunc(gl.LEQUAL) // Near things obscure far things

		// Clear the canvas before we start drawing on it.

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		// Create a perspective matrix, a special matrix that is
		// used to simulate the distortion of perspective in a camera.
		// Our field of view is 45 degrees, with a width/height
		// ratio that matches the display size of the canvas
		// and we only want to see objects between 0.1 units
		// and 100 units away from the camera.

		const fieldOfView = (45 * Math.PI) / 180 // in radians
		const aspect = gl.canvas.width / gl.canvas.height
		const zNear = 0.1
		const zFar = 100.0
		const projectionMatrix = mat4.create()

		// note: glmatrix.js always has the first argument
		// as the destination to receive the result.
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

		// Вычисляем положение камеры в сферических координатах
		const distance = 6.0
		const eye: ReadonlyVec3 = [
			distance * Math.cos(cameraRotationX) * Math.sin(cameraRotationY),
			distance * Math.sin(cameraRotationX),
			distance * Math.cos(cameraRotationX) * Math.cos(cameraRotationY),
		]
		const center: ReadonlyVec3 = [0, 0, 0]
		const up: ReadonlyVec3 = [0, 1, 0]

		const modelViewMatrix = mat4.create()
		mat4.lookAt(modelViewMatrix, eye, center, up)

		const normalMatrix = mat3.create()
		mat3.normalFromMat4(normalMatrix, modelViewMatrix)

		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute.
		this.setPositionAttribute()

		this.setColorAttribute()

		this.setNormalAttribute()

		// Tell WebGL which indices to use to index the vertices
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

		// Tell WebGL to use our program when drawing
		gl.useProgram(this.shaderProgram)

		// Set the shader uniforms
		gl.uniformMatrix3fv(
			this.normalMatrixLocation,
			false,
			normalMatrix,
		)
		gl.uniformMatrix4fv(
			this.projectionMatrix,
			false,
			projectionMatrix,
		)
		gl.uniformMatrix4fv(
			this.modelViewMatrix,
			false,
			modelViewMatrix,
		)

		// set the light direction.
		const lightX = -1
		const lightY = 1
		const lightZ = 1
		gl.uniform3fv(this.reverseLightDirection, [lightX * lightIntensity, lightY * lightIntensity, lightZ * lightIntensity])

		// Отрисовка граней
		{
			const vertexCount = this.indexCount
			const type = gl.UNSIGNED_SHORT
			const offset = 0
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
		}

		// Отрисовка рёбер
		{
			gl.disableVertexAttribArray(this.vertexColor)
			gl.vertexAttrib4f(this.vertexColor, 0, 0, 0, 1)
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeBuffer)
			gl.drawElements(gl.LINES, this.edgeCount, gl.UNSIGNED_SHORT, 0)
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

	// Tell WebGL how to pull out the colors from the color buffer
	// into the vertexColor attribute.
	private setColorAttribute() {
		const gl = this.gl
		const numComponents = 4
		const type = gl.FLOAT
		const normalize = false
		const stride = 0
		const offset = 0
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
		gl.vertexAttribPointer(
			this.vertexColor,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		)
		gl.enableVertexAttribArray(this.vertexColor)
	}

	private setNormalAttribute() {
		const gl = this.gl
		const numComponents = 3
		const type = gl.FLOAT // the data in the buffer is 32bit floats
		const normalize = false // don't normalize
		const stride = 0 // how many bytes to get from one set of values to the next
		const offset = 0 // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
		gl.vertexAttribPointer(
			this.normalLocation,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		)
		gl.enableVertexAttribArray(this.normalLocation)
	}

	private initBuffers() {
		const positionBuffer = this.initPositionBuffer()
		const colorBuffer = this.initColorBuffer()
		const indexBuffer = this.initIndexBuffer()
		const edgeBuffer = this.initEdgeBuffer()
		const normal = this.initNormalBuffer()

		return {
			position: positionBuffer,
			color: colorBuffer,
			indices: indexBuffer,
			edges: edgeBuffer,
			normal: normal,
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
		this.positions = positions.slice()

		for (let i = 2; i < positions.length; i += 3) {
			console.log((i - 2) / 3, [positions[i - 2], positions[i - 1], positions[i]])
		}

		// Now pass the list of positions into WebGL to build the
		// shape. We do this by creating a Float32Array from the
		// JavaScript array, then use it to fill the current buffer.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

		return positionBuffer
	}

	private initColorBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const numVertices = this.positions.length / 3
		const colors: number[] = []
		for (let i = 0; i < numVertices; i++) {
			colors.push(Math.random(), Math.random(), Math.random(), 1.0)
		}
		const colorBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

		return colorBuffer
	}

	private initEdgeBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const edgeIndices: number[] = []
		this.getLineFaces().forEach(item => {
			if (item.length > 1) {
				// @ts-expect-error
				edgeIndices.push(item[0], item[1])
			}
		})

		const edgeBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeBuffer)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(edgeIndices), gl.STATIC_DRAW)
		this.edgeCount = edgeIndices.length
		return edgeBuffer
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

		this.indexCount = indices.length
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
		return indexBuffer
	}

	private initNormalBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const positions = this.getPositions()
		const normals = this.computeNormals(positions, this.getTriangleFaces())
		const normalBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
		return normalBuffer
	}

	private computeNormals(positions: number[], faces: number[][]): number[] {
		const numVertices = positions.length / 3
		const normals = new Array(numVertices * 3).fill(1)

		faces.forEach(face => {
			if (face.length === 3) {
				// @ts-expect-error
				const idx0 = face[0] * 3
				// @ts-expect-error
				const idx1 = face[1] * 3
				// @ts-expect-error
				const idx2 = face[2] * 3

				// @ts-expect-error
				const p0 = vec3.fromValues(positions[idx0], positions[idx0 + 1], positions[idx0 + 2])
				// @ts-expect-error
				const p1 = vec3.fromValues(positions[idx1], positions[idx1 + 1], positions[idx1 + 2])
				// @ts-expect-error
				const p2 = vec3.fromValues(positions[idx2], positions[idx2 + 1], positions[idx2 + 2])

				const v1 = vec3.create()
				const v2 = vec3.create()
				vec3.subtract(v1, p1, p0)
				vec3.subtract(v2, p2, p0)

				const normal = vec3.create()
				vec3.cross(normal, v1, v2)
				vec3.normalize(normal, normal)

				for (const idx of face) {
					normals[idx * 3] += normal[0]
					normals[idx * 3 + 1] += normal[1]
					normals[idx * 3 + 2] += normal[2]
				}
			}
		})

		for (let i = 0; i < numVertices; i++) {
			const nx = normals[i * 3]
			const ny = normals[i * 3 + 1]
			const nz = normals[i * 3 + 2]
			const len = Math.hypot(nx, ny, nz)
			if (len > 0) {
				normals[i * 3] = nx / len
				normals[i * 3 + 1] = ny / len
				normals[i * 3 + 2] = nz / len
			}
		}

		return normals
	}

	private getPositions(): number[] {
		// https://en.wikipedia.org/wiki/Deltoidal_icositetrahedron
		const a = Math.sqrt(2) / 2
		const b = (2 * Math.sqrt(2) + 1) / 7

		return [
			// Красные вершины
			-1, 0, 0,
			1, 0, 0,

			0, -1, 0,
			0, 1, 0,

			0, 0, -1,
			0, 0, 1,

			// Синие вершины
			0, -a, -a,
			0, -a, a,
			0, a, -a,
			0, a, a,

			-a, 0, -a,
			-a, 0, a,
			a, 0, -a,
			a, 0, a,

			-a, -a, 0,
			-a, a, 0,
			a, -a, 0,
			a, a, 0,

			// Желтые вершины
			-b, -b, -b,
			-b, -b, b,
			-b, b, -b,
			-b, b, b,
			b, -b, -b,
			b, -b, b,
			b, b, -b,
			b, b, b,
		]
	}

	private getTriangleFaces(): number[][] {
		return [
			// Нижнее ложе
			[2, 7, 14],
			[2, 16, 7],
			[2, 14, 6],
			[2, 6, 16],

			// Верхнее ложе
			[3, 8, 15],
			[3, 15, 9],
			[3, 9, 17],
			[3, 17, 8],

			// Левое ложе
			[0, 10, 14],
			[0, 14, 11],
			[0, 11, 15],
			[0, 15, 10],

			// Правое ложе
			[1, 13, 16],
			[1, 17, 13],
			[1, 16, 12],
			[1, 12, 17],

			// Переднее ложе
			[5, 11, 7],
			[5, 9, 11],
			[5, 13, 9],
			[5, 7, 13],

			// Заднее ложе
			[4, 6, 10],
			[4, 10, 8],
			[4, 8, 12],
			[4, 12, 6],

			// Правое верхнее переднее ложе
			[25, 9, 13],
			[25, 13, 17],
			[25, 17, 9],

			// Левое верхнее переднее ложе
			[21, 11, 9],
			[21, 15, 11],
			[21, 9, 15],

			// Правое нижнее переднее ложе
			[23, 13, 7],
			[23, 16, 13],
			[23, 7, 16],

			// Левое нижнее переднее ложе
			[19, 7, 11],
			[19, 11, 14],
			[19, 14, 7],

			// Правое нижнее заднее ложе
			[22, 12, 16],
			[22, 6, 12],
			[22, 16, 6],

			// Левое нижнее заднее ложе
			[18, 14, 10],
			[18, 10, 6],
			[18, 6, 14],

			// Правое верхнее заднее ложе
			[24, 17, 12],
			[24, 8, 17],
			[24, 12, 8],

			// Левое верхнее заднее ложе
			[20, 10, 15],
			[20, 15, 8],
			[20, 8, 10],
		]
	}

	private getLineFaces(): number[][] {
		return [
			[0, 15],
			[0, 14],
			[0, 10],
			[0, 11],
			[15, 20],
			[15, 21],
			[15, 3],
			[14, 19],
			[14, 18],
			[14, 2],
			[21, 9],
			[21, 11],
			[20, 8],
			[20, 10],
			[19, 11],
			[19, 7],
			[18, 10],
			[18, 6],
			[11, 5],
			[10, 4],

			[1, 17],
			[1, 16],
			[1, 13],
			[1, 12],
			[17, 3],
			[17, 25],
			[17, 24],
			[16, 2],
			[16, 23],
			[16, 22],
			[25, 9],
			[25, 13],
			[24, 8],
			[24, 12],
			[23, 7],
			[23, 13],
			[22, 6],
			[22, 12],
			[13, 5],
			[12, 4],
			[22, 12],

			[9, 3],
			[9, 5],
			[8, 3],
			[8, 4],
			[7, 2],
			[7, 5],
			[6, 2],
			[6, 4],
		]
	}
}

export {
	DeltoidalIcositetrahedron,
}