import {KeyListener} from "./KeyListener.ts";
import {Direction, Player} from "./Player.ts";
import {Maze} from "./Maze.ts";
import {MouseListener} from "./MouseListener.ts";

class PlayerController {
    private keyListener: KeyListener;
    private mouseListener: MouseListener;
    private player: Player;
    private maze: Maze;
    private sensitivity: number = 0.001;

    constructor(player: Player, maze: Maze) {
        this.keyListener = new KeyListener();
        this.mouseListener = new MouseListener(
            (movementX: number) => {
                let direction = Direction.Right
                if (movementX < 0) {
                    movementX = -movementX
                    direction = Direction.Left
                }
                this.player.rotateTo(movementX * this.sensitivity, direction);
            }
        );
        this.player = player;
        this.maze = maze;
    }

    public updatePlayer(deltaTime: number) {
        // Движение (клавиатура)
        if (this.keyListener.IsDown('w')) this.player.moveTo(this.maze, deltaTime, Direction.Forward);
        if (this.keyListener.IsDown('s')) this.player.moveTo(this.maze, deltaTime, Direction.Backward);
        if (this.keyListener.IsDown('a')) this.player.moveTo(this.maze, deltaTime, Direction.Left);
        if (this.keyListener.IsDown('d')) this.player.moveTo(this.maze, deltaTime, Direction.Right);
        if (this.keyListener.IsDown('ArrowLeft')) this.player.rotateTo(deltaTime, Direction.Left);
        if (this.keyListener.IsDown('ArrowRight')) this.player.rotateTo(deltaTime, Direction.Right);

    }
}

export { PlayerController };