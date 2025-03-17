import { Renderable } from 'types';

export class Valve implements Renderable {
    private vertexCount: number;
    private readonly buffer: WebGLBuffer | null = null;

    constructor(
        private readonly gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
        private centerX: number,
        private centerY: number,
        private radiusX: number,
        private radiusY: number,
        private color: [number, number, number, number],
        segments: number = 32,
    ) {
        this.buffer = this.gl.createBuffer();
        this.vertexCount = segments * 3;

        const vertices = this.generateEllipseVertices(centerX, centerY, radiusX * 2, radiusY * 2, segments);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }

    private generateEllipseVertices(
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        segments: number,
    ): number[] {
        const vertices = [];
        for (let i = 0; i < segments; i++) {
            const angle1 = (i / segments) * 2 * Math.PI;
            const angle2 = ((i + 1) / segments) * 2 * Math.PI;

            vertices.push(centerX, centerY);
            vertices.push(centerX + Math.cos(angle1) * radiusX, centerY + Math.sin(angle1) * radiusY);
            vertices.push(centerX + Math.cos(angle2) * radiusX, centerY + Math.sin(angle2) * radiusY);
        }
        return vertices;
    }

    render() {
        const gl = this.gl;
        const posLoc = gl.getAttribLocation(this.program, 'position');
        const colorLoc = gl.getUniformLocation(this.program, 'u_color');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);
        gl.uniform4f(colorLoc, ...this.color);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
}