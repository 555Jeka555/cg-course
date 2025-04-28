const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 position;
uniform float progress;
uniform mat4 projection_view;

void main() {
    vec3 initial = vec3(position, position.x * position.x + position.y * position.y);
    vec3 final = vec3(position, position.x * position.x - position.y * position.y);
    vec3 morphed = mix(initial, final, progress);
    
    gl_Position = projection_view * vec4(morphed, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
out vec4 color;

void main() {
    color = vec4(1.0);
}
`;

class MorphingApp {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;
    private vertexBuffer: WebGLBuffer;
    private progressLocation: WebGLUniformLocation;
    private projectionViewLocation: WebGLUniformLocation;
    private progress: number = 0;
    private direction: number = 1;

    constructor() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.gl = this.canvas.getContext('webgl2')!;
        this.initShaders();
        this.initGeometry();
        this.initMatrices();
        this.animate();
        this.resize();
    }

    private initShaders() {
        const vs = this.compileShader(this.gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = this.compileShader(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

        this.program = this.gl.createProgram()!;
        this.gl.attachShader(this.program, vs);
        this.gl.attachShader(this.program, fs);
        this.gl.linkProgram(this.program);

        this.progressLocation = this.gl.getUniformLocation(this.program, 'progress')!;
        this.projectionViewLocation = this.gl.getUniformLocation(this.program, 'projection_view')!;
    }

    private compileShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error(this.gl.getShaderInfoLog(shader)!);
        }
        return shader;
    }

    private initGeometry() {
        const vertices: number[] = [];
        const rows = 100, cols = 100;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x0 = -1 + 2 * i / (rows - 1);
                const y0 = -1 + 2 * j / (cols - 1);

                if (i < rows - 1) {
                    const x1 = -1 + 2 * (i + 1) / (rows - 1);
                    vertices.push(x0, y0, x1, y0);
                }
                if (j < cols - 1) {
                    const y1 = -1 + 2 * (j + 1) / (cols - 1);
                    vertices.push(x0, y0, x0, y1);
                }
            }
        }

        this.vertexBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    }

    private initMatrices() {
        const view = this.translate(-2.5, 0, -3.5).multiply(this.rotateY(45));
        const projection = this.perspective(45, this.canvas.width/this.canvas.height, 0.1, 100);
        const pv = projection.multiply(view);

        this.gl.useProgram(this.program);
        this.gl.uniformMatrix4fv(this.projectionViewLocation, false, pv.data);
    }

    private animate() {
        this.progress += this.direction * 0.015;

        if (this.progress >= 1.0 || this.progress <= 0.0) {
            this.direction *= -1;
        }

        this.gl.uniform1f(this.progressLocation, this.progress);
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    private draw() {
        this.gl.clearColor(0.2, 0.2, 0.2, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

        const posAttrib = this.gl.getAttribLocation(this.program, 'position');
        this.gl.vertexAttribPointer(posAttrib, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(posAttrib);

        this.gl.drawArrays(this.gl.LINES, 0, 100*100*4);
    }

    private perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
        const f = 1 / Math.tan(fov * Math.PI / 360);
        return new Matrix4([
            f/aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far+near)/(near-far), (2*far*near)/(near-far),
            0, 0, -1, 0
        ]);
    }

    private rotateY(deg: number): Matrix4 {
        const rad = deg * Math.PI / 180;
        const c = Math.cos(rad), s = Math.sin(rad);
        return new Matrix4([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ]);
    }

    private translate(x: number, y: number, z: number): Matrix4 {
        return new Matrix4([
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        ]);
    }

    public resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
    }
}

class Matrix4 {
    data: Float32Array<any>;

    constructor(data: number[]) {
        this.data = new Float32Array(16);
        for (let i = 0; i < 16; i++) this.data[i] = data[i];
    }

    multiply(m: Matrix4): Matrix4 {
        const result = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] =
                    this.data[i * 4] * m.data[j] +
                    this.data[i * 4 + 1] * m.data[j + 4] +
                    this.data[i * 4 + 2] * m.data[j + 8] +
                    this.data[i * 4 + 3] * m.data[j + 12];
            }
        }
        return new Matrix4(Array.from(result));
    }
}

window.addEventListener('load', () => {
    const app = new MorphingApp();

    window.addEventListener('resize', () => {
        app.resize();
    });
});
