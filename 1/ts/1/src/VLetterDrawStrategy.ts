import { LetterDrawStrategyInterface } from "./LetterDrawStrategyInterface";

export class VLetterDrawStrategy implements LetterDrawStrategyInterface {
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 30);
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x + 30, y - 15);
        ctx.moveTo(x + 30, y);
        ctx.lineTo(x + 30, y - 30);
    }
}