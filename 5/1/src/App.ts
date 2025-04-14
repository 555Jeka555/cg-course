import {createShaderProgram} from './WebGLUtils'
import {Player} from './Player'
import {Maze} from './Maze'
import {MazeRenderer} from './MazeRenderer.ts'
import {PlayerController} from "./PlayerController.ts";
import {BackroundRenderer} from "./BackroundRenderer.ts";

class App {
    private readonly canvas: HTMLCanvasElement
    private readonly gl: WebGLRenderingContext
    private readonly program: WebGLProgram
    private readonly maze: Maze
    private readonly mazeRenderer: MazeRenderer
    private readonly backroundRenderer: BackroundRenderer
    private player: Player
    private playerController: PlayerController
    private lastTime: number = 0

    constructor() {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        const gl = this.canvas.getContext('webgl')
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        if (!gl) throw new Error('WebGL не поддерживается')
        this.gl = gl

        this.program = createShaderProgram(gl)
        gl.useProgram(this.program)

        this.maze = new Maze()
        this.player = new Player()
        this.mazeRenderer = new MazeRenderer(this.maze, this.canvas,  this.gl, this.program)
        this.backroundRenderer = new BackroundRenderer(this.maze, this.canvas,  this.gl, this.program)
        this.playerController = new PlayerController(this.player, this.maze)
    }

    run() {
        this.render(this.lastTime)
    }

    private render = (time: number) => {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;
        requestAnimationFrame(this.render);

        this.playerController.updatePlayer(deltaTime);
        this.backroundRenderer.Render()
        this.mazeRenderer.Render(this.player);
    }

}

export {App}