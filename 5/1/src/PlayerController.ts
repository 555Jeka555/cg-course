import {KeyListener} from "./KeyListener.ts";
import {Direction, Player} from "./Player.ts";
import {Labyrinth} from "./Labyrinth.ts";

class PlayerController {
    private readonly canvas: HTMLCanvasElement
    private readonly gl: WebGLRenderingContext
    private keyListener: KeyListener;
    private player: Player;
    private labyrinth: Labyrinth;
    private keysUp: { [key: string]: boolean } = {}

    constructor(
        canvas: HTMLCanvasElement,
        gl: WebGLRenderingContext,
        player: Player,
        labyrinth: Labyrinth
    ) {
        this.canvas = canvas
        this.keyListener = new KeyListener();
        this.player = player;
        this.labyrinth = labyrinth;
        this.setupEventListeners()
    }

    private resizeCanvas = () => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
    }

    private setupEventListeners() {
        window.addEventListener('resize', this.resizeCanvas)
        window.addEventListener('keydown', this.handleKeyDown)
        window.addEventListener('keyup', this.handleKeyUp)
    }

    public updatePlayer(deltaTime: number) {
        if (this.keysUp['ArrowUp']) {
            this.player.moveTo(this.labyrinth, deltaTime, Direction.Forward)
        }
        if (this.keysUp['ArrowDown']) {
            this.player.moveTo(this.labyrinth, deltaTime, Direction.Backward)
        }
        if (this.keysUp['ArrowLeft']) {
            this.player.rotateTo(deltaTime, Direction.Left)
        }
        if (this.keysUp['ArrowRight']) {
            this.player.rotateTo(deltaTime, Direction.Right)
        }
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keysUp[event.key] = true
    }

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keysUp[event.key] = false
    }
}

export { PlayerController };