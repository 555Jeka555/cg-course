const vertexShaderSource = `
attribute vec3 vertex_position;

void main() {
    gl_Position = vec4(vertex_position, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform float rect_width;
uniform float rect_height;
uniform vec2 area_w;
uniform vec2 area_h;
uniform int max_iterations;
uniform sampler2D palette_texture;
uniform float time; // Добавляем uniform для времени

void main() {
    vec2 C = vec2(gl_FragCoord.x * (area_w.y - area_w.x) / rect_width + area_w.x,
                 gl_FragCoord.y * (area_h.y - area_h.x) / rect_height + area_h.x);
    
    // Добавляем небольшую анимацию начальной точки
    C.x += 0.01 * sin(time * 0.5);
    C.y += 0.01 * cos(time * 0.3);
    
    vec2 Z = vec2(0.0);
    int iteration;
    
    for (int i = 0; i < 1000; i++) {
        if (i >= max_iterations) break;
        
        // Модифицируем формулу для анимации
        float x = (Z.x * Z.x) - (Z.y * Z.y) + C.x;
        float y = (2.0 + 0.1 * sin(time)) * Z.x * Z.y + C.y;
        
        if (x * x + y * y > 4.0) {
            iteration = i;
            break;
        }
        
        Z.x = x;
        Z.y = y;
        iteration = i + 1;
    }

    // Добавляем эффект пульсации в цветах
    float pulse = 0.5 + 0.5 * sin(time * 2.0);
    float smoothed = float(iteration) + 1.0 - log(log(length(Z))) / log(2.0);
    float normalized_iteration = (smoothed / float(max_iterations)) * pulse;
    
    vec3 color = texture2D(palette_texture, vec2(normalized_iteration, 0.5)).rgb;
    gl_FragColor = vec4((iteration >= max_iterations ? vec3(0.0) : color), 1.0);
}
`;

class MandelbrotViewer {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private vertexBuffer: WebGLBuffer;
    private vao: WebGLVertexArrayObject;
    private paletteTexture: WebGLTexture;

    private area_w: [number, number] = [-2.0, 1.0];
    private area_h: [number, number] = [-1.0, 1.0];
    private max_iterations = 1000;
    private zoom_factor = 0.1;
    private time = 0;
    private last_pos: {x: number, y: number} | null = null;

    constructor() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.width = 1600;
        this.canvas.height = 1000;
        this.canvas.style.cursor = 'move';

        const gl = this.canvas.getContext('webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        this.gl = gl;

        this.initialize();
        this.setupEventListeners();
        this.render();
    }

    private initialize() {
        this.setupShaders();
        this.setupGeometry();
        this.loadPaletteTexture();
        this.startAnimation();
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
    }

    private compileShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type);
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
        const vertices = new Float32Array([
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0,  1.0, 0.0,
            -1.0,  1.0, 0.0
        ]);

        this.vertexBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, "vertex_position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
    }

    private async loadPaletteTexture() {
        try {
            // Загружаем изображение палитры
            const paletteImage = await this.loadImage('../public/palette.png');

            // Создаем текстуру
            this.paletteTexture = this.gl.createTexture()!;
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.paletteTexture);

            // Загружаем данные изображения в текстуру
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                paletteImage
            );

            // Настраиваем параметры текстуры
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

            console.log('Palette texture loaded successfully');
        } catch (error) {
            console.error('Failed to load palette texture:', error);
            // В случае ошибки создаем простую палитру
            this.createFallbackPalette();
        }
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    private createFallbackPalette() {
        // Создаем резервную палитру (радужный градиент)
        const paletteSize = 256;
        const paletteData = new Uint8Array(paletteSize * 4);

        for (let i = 0; i < paletteSize; i++) {
            const t = i / paletteSize;
            paletteData[i * 4 + 0] = Math.floor(255 * (0.5 + 0.5 * Math.sin(t * 2.0 * Math.PI + 0.0)));
            paletteData[i * 4 + 1] = Math.floor(255 * (0.5 + 0.5 * Math.sin(t * 2.0 * Math.PI + 2.0)));
            paletteData[i * 4 + 2] = Math.floor(255 * (0.5 + 0.5 * Math.sin(t * 2.0 * Math.PI + 4.0)));
            paletteData[i * 4 + 3] = 255;
        }

        this.paletteTexture = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.paletteTexture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            paletteSize,
            1,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            paletteData
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }

    private startAnimation() {
        const animate = () => {
            this.time += 0.001;
            this.render();
            requestAnimationFrame(animate);
        };
        animate();
    }

    private render() {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);

        const timeLocation = gl.getUniformLocation(this.program, "time");
        if (timeLocation) {
            gl.uniform1f(timeLocation, this.time);
        }

        // Set uniforms
        gl.uniform1f(gl.getUniformLocation(this.program, "rect_width"), this.canvas.width);
        gl.uniform1f(gl.getUniformLocation(this.program, "rect_height"), this.canvas.height);
        gl.uniform2fv(gl.getUniformLocation(this.program, "area_w"), this.area_w);
        gl.uniform2fv(gl.getUniformLocation(this.program, "area_h"), this.area_h);
        gl.uniform1i(gl.getUniformLocation(this.program, "max_iterations"), this.max_iterations);

        // Bind palette texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
        gl.uniform1i(gl.getUniformLocation(this.program, "palette_texture"), 0);

        // Draw
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    private setupEventListeners() {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -e.deltaY / 100;
            const zoom_factor = 1 + delta * this.zoom_factor;

            const center_x = (this.area_w[1] + this.area_w[0]) / 2;
            const center_y = (this.area_h[1] + this.area_h[0]) / 2;

            this.area_w = [
                center_x - (center_x - this.area_w[0]) * zoom_factor,
                center_x + (this.area_w[1] - center_x) * zoom_factor
            ];

            this.area_h = [
                center_y - (center_y - this.area_h[0]) * zoom_factor,
                center_y + (this.area_h[1] - center_y) * zoom_factor
            ];

            this.render();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left button
                this.last_pos = { x: e.clientX, y: e.clientY };
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.last_pos) {
                const dx = e.clientX - this.last_pos.x;
                const dy = this.last_pos.y - e.clientY;

                const area_width = this.area_w[1] - this.area_w[0];
                const area_height = this.area_h[1] - this.area_h[0];

                const dx_scaled = dx * area_width / this.canvas.width;
                const dy_scaled = dy * area_height / this.canvas.height;

                this.area_w[0] -= dx_scaled;
                this.area_w[1] -= dx_scaled;
                this.area_h[0] -= dy_scaled;
                this.area_h[1] -= dy_scaled;

                this.last_pos = { x: e.clientX, y: e.clientY };
                this.render();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.last_pos = null;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.last_pos = null;
        });

        window.addEventListener('keydown', (e) => {
            const step = 10;
            let dx = 0;
            let dy = 0;

            switch (e.key) {
                case 'ArrowDown': dy = step; break;
                case 'ArrowUp': dy = -step; break;
                case 'ArrowRight': dx = -step; break;
                case 'ArrowLeft': dx = step; break;
                default: return;
            }

            const area_width = this.area_w[1] - this.area_w[0];
            const area_height = this.area_h[1] - this.area_h[0];

            const dx_scaled = dx * area_width / this.canvas.width;
            const dy_scaled = dy * area_height / this.canvas.height;

            this.area_w[0] -= dx_scaled;
            this.area_w[1] -= dx_scaled;
            this.area_h[0] -= dy_scaled;
            this.area_h[1] -= dy_scaled;

            this.render();
        });

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.render();
        });
    }
}

// Initialize the app when the page loads
window.addEventListener('load', () => {
    new MandelbrotViewer();
});