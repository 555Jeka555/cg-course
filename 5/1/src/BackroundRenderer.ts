import {Maze} from "./Maze.ts";

class BackroundRenderer {
    private readonly gl: WebGLRenderingContext
    private readonly program: WebGLProgram

    private readonly canvas: HTMLCanvasElement

    constructor(maze: Maze, canvas: HTMLCanvasElement, gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl
        this.program = program
        this.canvas = canvas

        const matrixLoc = gl.getUniformLocation(this.program, 'u_matrix')
        const colorLoc = gl.getUniformLocation(this.program, 'u_color')
        if (!matrixLoc || !colorLoc) throw new Error('Не удалось получить uniform-переменные')
    }

    public Render() {
    }
}

export {
    BackroundRenderer
}