import { LetterDrawStrategyInterface } from "./LetterDrawStrategyInterface";

export class Letter {
    private static readonly INIT_Y: number = 100;
    private static readonly HEIGHT_OF_JUMP: number = 50;
    private static readonly ANIMATION_DURATION: number = 1000;

    constructor(
        private letterDrawStrategy: LetterDrawStrategyInterface,
        private x: number,
        private color: string,
        private phase: number,
        private initialY: number = Letter.INIT_Y,
        private jumpHeight: number = Letter.HEIGHT_OF_JUMP,
        private animationDuration: number = Letter.ANIMATION_DURATION,
        private startTime: number | null = null,
    ) {
    }

    draw (ctx: CanvasRenderingContext2D, currentTime: number): void {
        if (this.startTime === null) {
            this.startTime = currentTime;
        }
        const time = (currentTime - this.startTime + this.phase) % this.animationDuration;
        const jumpProgress = Math.sin(time / this.animationDuration * Math.PI);
        const y = this.initialY - jumpProgress * this.jumpHeight;

        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        this.letterDrawStrategy.draw(ctx, this.x, y);

        ctx.stroke();
    }
}