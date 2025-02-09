import { LetterDrawStrategyInterface } from "./LetterDrawStrategyInterface";

export class ALetterDrawStrategy implements LetterDrawStrategyInterface {
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 60, y - 120);

        ctx.moveTo(x + 60, y - 120);
        ctx.lineTo(x + 120, y);

        ctx.moveTo(x + 30, y - 60);
        ctx.lineTo(x + 90, y - 60);
    }
}