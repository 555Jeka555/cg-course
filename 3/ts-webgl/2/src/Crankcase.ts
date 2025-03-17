import { Renderable } from 'types';

export class Crankcase implements Renderable {
    private vertexCount = 6;
    private readonly buffer: WebGLBuffer | null = null;

    constructor(
        private readonly gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
    ) {
        this.buffer = this.gl.createBuffer();

        const rectVertices = [
            -3.2, -7,
            3.2, -7,
            -3.2, 3,
            -3.2, 3,
            3.2, -7,
            3.2, 3
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectVertices), gl.STATIC_DRAW);
    }

    render() {
        const gl = this.gl;
        const posLoc = gl.getAttribLocation(this.program, 'position');
        const colorLoc = gl.getUniformLocation(this.program, 'u_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);

        gl.uniform4f(colorLoc, 0.5, 0.5, 0.5, 1);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
}