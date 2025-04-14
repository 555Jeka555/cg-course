const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
	attribute vec3 aNormal;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;

    varying lowp vec4 vColor;
    varying vec3 vNormal;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
      vNormal = normalize(uNormalMatrix * aNormal);
    }
`

const fragmentShaderSource = `
	precision mediump float;

    varying lowp vec4 vColor;

	varying vec3 vNormal;
	uniform vec3 uReverseLightDirection;
	
    void main(void) {
      vec3 normal = normalize(vNormal);
      normal = gl_FrontFacing ? normal : -normal;
      float light = max(dot(normal, uReverseLightDirection), 0.0);
      gl_FragColor = vColor;
      gl_FragColor.rgb *= light;
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

export {
	createShaderProgram,
}
