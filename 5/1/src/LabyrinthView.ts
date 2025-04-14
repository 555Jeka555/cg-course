import {mat4} from "gl-matrix";
import {Labyrinth} from "./Labyrinth.ts";
import {loadTexture} from "./WebGLUtils.ts";

export enum WALL_TYPE {
    EMPTY = 0,
    BRICK,
    BAD,
    CONCRETE,
    STONE,
    WHITE,
    MOULD,
}

export class LabyrinthView {
    private readonly wallTexture: WebGLTexture;

    private cubeVertexBuffer: WebGLBuffer | null = null;
    private cubeIndexBuffer: WebGLBuffer | null = null;

    private isTextureLoaded = false
    private cubeIndexCount = 0;

    constructor(
        private readonly labyrinth: Labyrinth,
        private readonly gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
        private readonly uMatrixLocation: WebGLUniformLocation,
        private readonly uColorLocation: WebGLUniformLocation,
        private readonly uTextureLocation: WebGLUniformLocation,
    ) {
        // Загрузка текстуры
        this.wallTexture = loadTexture(this.gl, 'brick.jpg', () => {
            this.isTextureLoaded = true;
        });

        this.initCubeBuffers();
    }

    render(countCubeIndex: number, projectionMatrix: mat4, viewMatrix: mat4) {
        if (!this.isTextureLoaded) return;

        // Привязка текстуры
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.wallTexture);
        this.gl.uniform1i(this.uTextureLocation, 0);

        // Привязка индексного буфера
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer);
        for (let z = 0; z < this.labyrinth.size; z++) {
            for (let x = 0; x < this.labyrinth.size; x++) {
                if (this.labyrinth.map[z]![x] === 1) {
                    const mvpMatrix = this.calcFinalMatrix(x, z, projectionMatrix, viewMatrix)
                    this.gl.uniformMatrix4fv(this.uMatrixLocation, false, mvpMatrix)
                    this.gl.uniform4fv(this.uColorLocation, [(z / this.labyrinth.size), (x / this.labyrinth.size), 0.3, 1])
                    this.gl.drawElements(this.gl.TRIANGLES, countCubeIndex, this.gl.UNSIGNED_SHORT, 0)
                }
            }
        }
    }

    private initCubeBuffers() {
        const gl = this.gl;

        // Вершины куба с текстурными координатами
        const vertices = new Float32Array([    // Передняя грань (Z = 0)
            0, 0, 0, 0, 0, 1, 0, 0, 1, 0,
            1, 1, 0, 1, 1, 0, 1, 0, 0, 1,
            // Задняя грань (Z = 1)
            0, 0, 1, 1, 0, 1, 0, 1, 0, 0,
            1, 1, 1, 0, 1, 0, 1, 1, 1, 1,
            // Левая грань (X = 0)
            0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
            0, 1, 1, 1, 1, 0, 1, 0, 0, 1,
            // Правая грань (X = 1)
            1, 0, 0, 1, 0, 1, 0, 1, 0, 0,
            1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
        ]);

        const indices = new Uint16Array([
            // Передняя грань (корректная)
            4, 5, 6, 4, 6, 7,

            // Задняя грань (корректная)
            0, 2, 1, 0, 3, 2,

            // Левая грань (исправлено направление)
            0, 4, 7, 0, 7, 3,

            // Правая грань (корректная)
            1, 6, 5, 1, 2, 6,

            // Верхняя грань (исправлено направление)
            3, 7, 6, 3, 6, 2,

            // Нижняя грань (исправлено направление)
            0, 5, 4, 0, 1, 5
        ]);

        this.cubeIndexCount = indices.length;

        // Создаем и заполняем буфер вершин
        this.cubeVertexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Создаем и заполняем индексный буфер
        this.cubeIndexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // Настройка атрибутов
        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        const texcoordLocation = gl.getAttribLocation(this.program, 'a_texcoord');

        gl.enableVertexAttribArray(positionLocation);
        gl.enableVertexAttribArray(texcoordLocation);

        // Шаг в байтах между вершинами (5 значений * 4 байта)
        const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

        // Настройка атрибута позиций
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
        gl.vertexAttribPointer(
            positionLocation,
            3,
            gl.FLOAT,
            false,
            stride,
            0
        );

        // Настройка атрибута текстурных координат
        gl.vertexAttribPointer(
            texcoordLocation,
            2,
            gl.FLOAT,
            false,
            stride,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
    }

    private calcFinalMatrix(x: number, z: number, projectionMatrix: mat4, viewMatrix: mat4) {
        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, [x, 0, z])
        const mvpMatrix = mat4.create()
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

        return mvpMatrix
    }
}