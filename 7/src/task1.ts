const vertexShaderSource = `
attribute float position;
uniform mat4 modelViewProjection;

float CalculateRadius(float x) {
    return (1.0 + sin(x)) *
           (1.0 + 0.9 * cos(8.0*x)) *
           (1.0 + 0.1 * cos(24.0 * x)) *
           (0.5 + 0.05 * cos(140.0 * x));
}

void main() {
    float x = position;
    float R = CalculateRadius(x);
    
    vec4 pos = vec4(
        R * cos(x) * 0.5,
        R * sin(x) * 0.5 - 0.5, // Сдвиг по Y
        0.0,
        1.0
    );
    
    gl_Position = modelViewProjection * pos;
}
`;

const fragmentShaderSource = `
precision highp float;

void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Белый цвет
}
`;

class CurvedLineApp {
    private readonly canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private positionBuffer: WebGLBuffer;
    private positions: Float32Array<any>;
    private modelViewProjectionUniform: WebGLUniformLocation | null;

    constructor() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        let gl: WebGLRenderingContext | null = this.canvas.getContext('webgl');
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
        this.resize();
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

        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);

        this.modelViewProjectionUniform = this.gl.getUniformLocation(this.program, 'modelViewProjection');
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
        const pointCount = 1000;
        this.positions = new Float32Array(pointCount);
        for (let i = 0; i < pointCount; i++) {
            this.positions[i] = i * (2 * Math.PI / pointCount);
        }

        this.positionBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positions, this.gl.STATIC_DRAW);
    }

    private render() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);

        const aspect = this.canvas.width / this.canvas.height;
        let left = -1.0, right = 1.0, bottom = -1.0, top = 1.0;

        if (aspect > 1) {       // Ландшафтный режим
            left *= aspect;     // Расширяем по X
            right *= aspect;
        } else {                // Портретный режим
            bottom /= aspect;   // Расширяем по Y
            top /= aspect;
        }

        //  Генерация матрицы проекции
        const projectionMatrix = this.createOrthographicMatrix(left, right, bottom, top);
        if (this.modelViewProjectionUniform) {
            this.gl.uniformMatrix4fv(
                this.modelViewProjectionUniform,
                false,
                projectionMatrix
            );
        }

        const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(positionAttributeLocation, 1, this.gl.FLOAT, false, 0, 0);

        this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.positions.length);

        requestAnimationFrame(() => this.render());
    }

    public resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
    }

    private createOrthographicMatrix(
        left: number,
        right: number,
        bottom: number,
        top: number
    ): Float32Array<any> {
        return new Float32Array([
            2 / (right - left), 0, 0, 0,   // Сжимает X-координаты до диапазона [-1, 1]
            0, 2 / (top - bottom), 0, 0,   // Сжимает Y-координаты до диапазона [-1, 1]
            0, 0, 1, 0,                    // Z без изменений так как 2D
            -(right + left)/(right - left), -(top + bottom)/(top - bottom), 0, 1 // -(right + left) / (right - left): Сдвигает центр по X в 0. -(top + bottom) / (top - bottom): Сдвигает центр по Y в 0.
        ]);
    }
}

window.addEventListener('load', () => {
    const app = new CurvedLineApp();

    window.addEventListener('resize', () => {
        app.resize();
    });
});