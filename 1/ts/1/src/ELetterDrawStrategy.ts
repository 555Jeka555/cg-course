import { LetterDrawStrategyInterface } from "./LetterDrawStrategyInterface";

export class ELetterDrawStrategy implements LetterDrawStrategyInterface {
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 60);

        ctx.moveTo(x, y);
        ctx.lineTo(x + 30, y);

        ctx.moveTo(x, y - 60);
        ctx.lineTo(x + 30, y - 60);

        ctx.moveTo(x, y - 30);
        ctx.lineTo(x + 20, y - 30);
    }
}