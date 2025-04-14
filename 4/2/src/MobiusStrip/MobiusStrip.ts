import {mat3, mat4, ReadonlyVec3, vec3} from 'gl-matrix'

class MobiusStrip {
	private readonly positionBuffer: WebGLBuffer | null
	private readonly colorBuffer: WebGLBuffer | null
	private readonly edgeBuffer: WebGLBuffer | null
	private readonly indexBuffer: WebGLBuffer | null
	private readonly normalBuffer: WebGLBuffer | null

	private readonly vertexPosition: number
	private readonly vertexColor: number
	private readonly projectionMatrixLocation: WebGLUniformLocation | null
	private readonly modelViewMatrixLocation: WebGLUniformLocation | null
	private readonly normalMatrixLocation: WebGLUniformLocation | null
	private readonly normalLocation: number

	private readonly reverseLightDirection: WebGLUniformLocation | null

	private edgeCount = 0
	private indexCount = 0
	private positions: number[] = []

	private readonly segmentsU = 100
	private readonly segmentsV = 5

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
		this.projectionMatrixLocation = gl.getUniformLocation(
			shaderProgram,
			'uProjectionMatrix',
		)
		this.modelViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
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
			this.projectionMatrixLocation,
			false,
			projectionMatrix,
		)
		gl.uniformMatrix4fv(
			this.modelViewMatrixLocation,
			false,
			modelViewMatrix,
		)

		// set the light direction.
		const lightDir = vec3.fromValues(-1, 1, 1)
		vec3.normalize(lightDir, lightDir)
		vec3.scale(lightDir, lightDir, lightIntensity)
		gl.uniform3fv(this.reverseLightDirection, lightDir)

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

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

		return positionBuffer
	}

	private initColorBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const numVertices = this.positions.length / 3
		const colors: number[] = []
		for (let i = 0; i < numVertices; i++) {
			colors.push(0.8, 0.3, 0, 1.0)
		}
		const colorBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

		return colorBuffer
	}

	private initEdgeBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const edgeIndices: number[] = []
		const lineFaces = this.getLineFaces()
		lineFaces.forEach(item => {
			if (item.length === 2) {
				edgeIndices.push(...item)
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
		const indices: number[] = []
		for (const face of triangleFaces) {
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
		const normals = this.computeNormals()
		const normalBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
		return normalBuffer
	}

	private computeNormals(): number[] {
		const normals: number[] = []
		const uMin = 0
		const uMax = 2 * Math.PI
		const vMin = -1
		const vMax = 1

		for (let i = 0; i <= this.segmentsU; i++) {
			const u = uMin + ((uMax - uMin) * i) / this.segmentsU
			const cosU = Math.cos(u)
			const sinU = Math.sin(u)
			const cosU2 = Math.cos(u / 2)
			const sinU2 = Math.sin(u / 2)

			for (let j = 0; j <= this.segmentsV; j++) {
				const v = vMin + ((vMax - vMin) * j) / this.segmentsV

				const factor = 1 + (v / 2) * cosU2
				const dx_du = -factor * sinU - (v * sinU2 * cosU) / 4
				const dy_du = -(v * cosU2) / 4
				const dz_du = factor * cosU - (v * sinU2 * sinU) / 4

				const dFactor_dv = cosU2 / 2
				const dx_dv = dFactor_dv * cosU
				const dy_dv = -Math.sin(u / 2) / 2
				const dz_dv = dFactor_dv * sinU

				const du = vec3.fromValues(dx_du, dy_du, dz_du)
				const dv = vec3.fromValues(dx_dv, dy_dv, dz_dv)
				const normal = vec3.cross(vec3.create(), du, dv)
				vec3.normalize(normal, normal)
				normals.push(...normal)
			}
		}

		return normals
	}

	// x(u,v) = (1 + v/2 * cos(u/2)) * cos(u)
	// y(u,v) = (1 + v/2 * cos(u/2)) * sin(u)
	// z(u,v) = (v/2) * sin(u/2)
	private getPositions(): number[] {
		const positions: number[] = []
		const uMin = 0
		const uMax = 2 * Math.PI
		const vMin = -1
		const vMax = 1

		for (let i = 0; i <= this.segmentsU; i++) {
			const u = uMin + ((uMax - uMin) * i) / this.segmentsU
			const cosU = Math.cos(u)
			const sinU = Math.sin(u)
			const cosU2 = Math.cos(u / 2)
			const sinU2 = Math.sin(u / 2)
			for (let j = 0; j <= this.segmentsV; j++) {
				const v = vMin + ((vMax - vMin) * j) / this.segmentsV
				const factor = 1 + (v / 2) * cosU2
				const x = factor * cosU
				// const y = factor * sinU
				// const z = (v / 2) * sinU2
				const z = factor * sinU
				const y = -(v / 2) * sinU2
				positions.push(x, y, z)
			}
		}

		return positions
	}

	private getTriangleFaces(): number[][] {
		const faces: number[][] = []
		for (let i = 0; i < this.segmentsU; i++) {
			for (let j = 0; j < this.segmentsV; j++) {
				const idx1 = i * (this.segmentsV + 1) + j
				const idx2 = (i + 1) * (this.segmentsV + 1) + j
				const idx3 = i * (this.segmentsV + 1) + (j + 1)
				const idx4 = (i + 1) * (this.segmentsV + 1) + (j + 1)
				faces.push([idx1, idx2, idx3])
				faces.push([idx3, idx2, idx4])
			}
		}

		return faces
	}

	private getLineFaces(): number[][] {
		const lines: number[][] = []
		for (let i = 0; i <= this.segmentsU; i++) {
			for (let j = 0; j < this.segmentsV; j++) {
				const idx1 = i * (this.segmentsV + 1) + j
				const idx2 = i * (this.segmentsV + 1) + (j + 1)
				lines.push([idx1, idx2])
			}
		}
		for (let j = 0; j <= this.segmentsV; j++) {
			for (let i = 0; i < this.segmentsU; i++) {
				const idx1 = i * (this.segmentsV + 1) + j
				const idx2 = (i + 1) * (this.segmentsV + 1) + j
				lines.push([idx1, idx2])
			}
		}
		return lines
	}
}

export {
	MobiusStrip,
}