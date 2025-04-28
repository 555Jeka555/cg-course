const vertexShaderSource = `
attribute float position;
uniform vec2 u_resolution;

float CalculateRadius(float x) {
    return (1.0 + sin(x)) *
           (1.0 + 0.9 * cos(8.0*x)) *
           (1.0 + 0.1 * cos(24.0 * x)) *
           (0.5 + 0.05 * cos(140.0 * x));
}

void main() {
    float x = position;
    float R = CalculateRadius(x);
    
    // Вычисляем позицию в координатах от -1 до 1
    vec2 pos;
    pos.x = R * cos(x) * 0.5;
    pos.y = R * sin(x) * 0.5;
    
    // Масштабируем с учетом соотношения сторон
    float aspect = u_resolution.x / u_resolution.y;
    if (aspect > 1.0) {
        pos.x /= aspect;
    } else {
        pos.y *= aspect;
    }
    
    pos.y -= 0.5;
    
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = 2.0;
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
    private resolutionUniformLocation: WebGLUniformLocation | null;

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

        this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');

        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);
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

        if (this.resolutionUniformLocation) {
            this.gl.uniform2f(this.resolutionUniformLocation, this.canvas.width, this.canvas.height);
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
}

window.addEventListener('load', () => {
    const app = new CurvedLineApp();

    window.addEventListener('resize', () => {
        app.resize();
    });
});