import { LetterDrawStrategyInterface } from "./LetterDrawStrategyInterface";

export class VLetterDrawStrategy implements LetterDrawStrategyInterface {
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 120);

        ctx.moveTo(x, y);
        ctx.lineTo(x + 60, y);
        ctx.moveTo(x, y - 120);

        ctx.lineTo(x + 60, y - 120);
        ctx.arc(x + 60, y - 90, 30, 3 * Math.PI / 2, Math.PI / 2);
        ctx.arc(x + 60, y - 30, 30, 3 * Math.PI / 2, Math.PI / 2);

        ctx.moveTo(x, y - 60);
        ctx.lineTo(x + 70, y - 60);
    }
}