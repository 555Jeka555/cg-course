import { LetterDrawStrategyInterface } from "./LetterDrawStrategyInterface";

export class ELetterDrawStrategy implements LetterDrawStrategyInterface {
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 120);

        ctx.moveTo(x, y);
        ctx.lineTo(x + 60, y);

        ctx.moveTo(x, y - 120);
        ctx.lineTo(x + 60, y - 120);

        ctx.moveTo(x, y - 60);
        ctx.lineTo(x + 50, y - 60);
    }
}