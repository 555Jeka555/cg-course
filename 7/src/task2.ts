const vertexShaderSource = `
attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_radius;

void main() {
    vec2 center = u_center * u_resolution;           // Пересчет центра в пиксельные координаты
    float dist = distance(gl_FragCoord.xy, center);  // Вычисление расстояния от текущего пикселя до центра
    
    if (dist < u_radius) {
        gl_FragColor = vec4(0.71, 0.13, 0.18, 1.0); // Крассный круг
    } else {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Белый фон
    }
    
    if (dist < u_radius * 0.5) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Крассный круг
    }
}
`;

class JapaneseFlag {
    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private positionBuffer: WebGLBuffer;

    constructor() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const gl = this.canvas.getContext('webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        this.gl = gl;

        this.initialize();
        this.render();
    }

    private initialize() {
        this.setupShaders();
        this.setupGeometry();
    }

    private setupShaders() {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.gl.createProgram()!;
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(this.program));
        }
    }

    private compileShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            throw new Error('Shader compilation failed');
        }

        return shader;
    }

    private setupGeometry() {
        this.positionBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                1, -1,
                -1,  1,
                -1,  1,
                1, -1,
                1,  1
            ]),
            this.gl.STATIC_DRAW
        );
    }

    private render() {
        const gl = this.gl;

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);

        const positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");
        gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

        const centerLocation = gl.getUniformLocation(this.program, "u_center");
        gl.uniform2f(centerLocation, 0.5, 0.5);

        const radiusLocation = gl.getUniformLocation(this.program, "u_radius");
        const radius = (this.canvas.height * 2) / 8;
        gl.uniform1f(radiusLocation, radius);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(() => this.render());
    }

    public resize() {
        const width = window.innerWidth;
        const height = Math.floor(width * 2 / 3);
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

window.addEventListener('load', () => {
    const flag = new JapaneseFlag();

    window.addEventListener('resize', () => {
        flag.resize();
    });
});