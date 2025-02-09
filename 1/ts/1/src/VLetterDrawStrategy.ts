import { LetterDrawStrategyInterface } from "./LetterDrawStrategyInterface";

export class VLetterDrawStrategy implements LetterDrawStrategyInterface {
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 60);

        ctx.moveTo(x, y);
        ctx.lineTo(x + 30, y);
        ctx.moveTo(x, y - 60);

        ctx.lineTo(x + 30, y - 60);
        ctx.arc(x + 30, y - 45, 15, 3 * Math.PI / 2, Math.PI / 2);
        ctx.arc(x + 30, y - 15, 15, 3 * Math.PI / 2, Math.PI / 2);

        ctx.moveTo(x, y - 30);
        ctx.lineTo(x + 35, y - 30);
    }
}