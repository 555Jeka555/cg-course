import {mat4} from "gl-matrix";
import {Labyrinth} from "./Labyrinth.ts";

export class LabyrinthView {
    private labyrinth: Labyrinth
    private gl: WebGLRenderingContext
    private readonly uMatrixLocation: WebGLUniformLocation
    private readonly uColorLocation: WebGLUniformLocation

    constructor(labyrinth: Labyrinth, gl: WebGLRenderingContext, uMatrixLocation: WebGLUniformLocation, uColorLocation: WebGLUniformLocation) {
        this.labyrinth = labyrinth
        this.gl = gl
        this.uMatrixLocation = uMatrixLocation
        this.uColorLocation = uColorLocation
    }

    draw(countCubeIndex: number, projectionMatrix: mat4, viewMatrix: mat4) {
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

    private calcFinalMatrix(x: number, z: number, projectionMatrix: mat4, viewMatrix: mat4) {
        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, [x, 0, z])
        const mvpMatrix = mat4.create()
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

        return mvpMatrix
    }
}