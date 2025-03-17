import { Renderable } from 'types';

export class Crankshaft implements Renderable {
    private rectVertexCount = 6;
    private readonly circleVertexCount: number;
    private readonly rectBuffer: WebGLBuffer | null = null;
    private readonly circleBuffer: WebGLBuffer | null = null;

    constructor(
        private readonly gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
    ) {
        this.rectBuffer = this.gl.createBuffer();
        this.circleBuffer = this.gl.createBuffer();

        const rectVertices = [
            -3.2, -1.6,
            3.2, -1.6,
            -3.2, 1.6,
            -3.2, 1.6,
            3.2, -1.6,
            3.2, 1.6
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this.rectBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectVertices), gl.STATIC_DRAW);

        const radius = 1.2;
        const centerX = 0;
        const centerY = -4.8;
        const segments = 32;
        this.circleVertexCount = segments * 3;

        const circleVertices = [];
        for (let i = 0; i < segments; i++) {
            const angle1 = (i / segments) * 2 * Math.PI;
            const angle2 = ((i + 1) / segments) * 2 * Math.PI;

            circleVertices.push(centerX, centerY);
            circleVertices.push(centerX + Math.cos(angle1) * radius, centerY + Math.sin(angle1) * radius);
            circleVertices.push(centerX + Math.cos(angle2) * radius, centerY + Math.sin(angle2) * radius);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);
    }

    render() {
        const gl = this.gl;
        const posLoc = gl.getAttribLocation(this.program, 'position');
        const colorLoc = gl.getUniformLocation(this.program, 'u_color');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.rectBuffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);
        gl.uniform4f(colorLoc, 0.5, 0.5, 0.5, 1);
        gl.drawArrays(gl.TRIANGLES, 0, this.rectVertexCount);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);
        gl.uniform4f(colorLoc, 0.8, 0.2, 0.2, 1);
        gl.drawArrays(gl.TRIANGLES, 0, this.circleVertexCount);
    }
}