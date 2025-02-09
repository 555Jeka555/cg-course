import { LetterDrawStrategyInterface } from "./LetterDrawStrategyInterface";

export class ALetterDrawStrategy implements LetterDrawStrategyInterface {
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 30, y - 60);

        ctx.moveTo(x + 30, y - 60);
        ctx.lineTo(x + 60, y);

        ctx.moveTo(x + 15, y - 30);
        ctx.lineTo(x + 45, y - 30);
    }
}