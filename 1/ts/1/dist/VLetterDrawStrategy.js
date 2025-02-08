export class VLetterDrawStrategy {
    draw(ctx, x, y) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 30);
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x + 30, y - 15);
        ctx.moveTo(x + 30, y);
        ctx.lineTo(x + 30, y - 30);
    }
}
