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

const createShaderProgram = (gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram => {
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

const loadTexture = (gl: WebGLRenderingContext, url: string): Promise<WebGLTexture> => new Promise((resolve, reject) => {
	const texture = gl.createTexture()
	if (!texture) {
		reject(new Error('Не удалось создать текстуру'))
		return
	}

	gl.bindTexture(gl.TEXTURE_2D, texture)

	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([255, 0, 255, 255]),
	)

	const image = new Image()
	image.onload = () => {
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

		if ((image.width & (image.width - 1)) !== 0 || (image.height & (image.height - 1)) !== 0) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		}
		else {
			gl.generateMipmap(gl.TEXTURE_2D)
		}
		resolve(texture)
	}
	image.src = url
	image.onerror = () => reject(new Error('Ошибка загрузки изображения'))
})


export {
	createShaderProgram,
	loadTexture,
}
