import {Size} from './types'

const vertexShaderSource = `
  attribute vec2 position;
  uniform mat4 u_matrix;

  void main() {
    gl_Position = u_matrix * vec4(position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  
  void main() {
    gl_FragColor = u_color;
  }
`

const compileShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
	const shader = gl.createShader(type)
	if (!shader) {
		throw new Error('Не удалось создать шейдер')
	}
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const err = gl.getShaderInfoLog(shader)
		gl.deleteShader(shader)
		throw new Error('Ошибка компиляции шейдера: ' + err)
	}
	return shader
}

const createShaderProgram = (gl: WebGLRenderingContext): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

	const program = gl.createProgram()
	if (!program) {
		throw new Error('Не удалось создать программу')
	}
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const err = gl.getProgramInfoLog(program)
		throw new Error('Ошибка линковки программы: ' + err)
	}
	return program
}

const computeOrthoMatrix = (canvasWidth: number, canvasHeight: number): Float32Array => {
	const {width, height} = getWorldSize()

	const worldLeft = -width / 2
	const worldRight = width / 2
	const worldBottom = -height / 2
	const worldTop = height / 2
	const worldWidth = worldRight - worldLeft
	const worldHeight = worldTop - worldBottom
	const worldAspect = worldWidth / worldHeight
	const canvasAspect = canvasWidth / canvasHeight

	let left = worldLeft
	let right = worldRight
	let bottom = worldBottom
	let top = worldTop

	if (canvasAspect > worldAspect) {
		const newWorldWidth = worldHeight * canvasAspect
		const delta = (newWorldWidth - worldWidth) / 2
		left = worldLeft - delta
		right = worldRight + delta
	}
	else {
		const newWorldHeight = worldWidth / canvasAspect
		const delta = (newWorldHeight - worldHeight) / 2
		bottom = worldBottom - delta
		top = worldTop + delta
	}

	const tx = (right + left) / (left - right)
	const ty = (top + bottom) / (bottom - top)
	const sx = 2 / (right - left)
	const sy = 2 / (top - bottom)

	return new Float32Array([
		sx, 0, 0, 0,
		0, sy, 0, 0,
		0, 0, 1, 0,
		tx, ty, 0, 1,
	])
}

const getWorldSize = (): Size => ({width: 30, height: 20})

export {
	createShaderProgram,
	computeOrthoMatrix,
	getWorldSize,
}