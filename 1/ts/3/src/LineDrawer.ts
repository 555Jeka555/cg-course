export class LineDrawer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        const xIncrement = dx / steps;
        const yIncrement = dy / steps;

        let x = x1;
        let y = y1;

        this.ctx.fillStyle = color;

        for (let i = 0; i <= steps; i++) {
            if (this.isPointInsideCanvas(x, y)) {
                this.ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
            }
            x += xIncrement;
            y += yIncrement;
        }
    }

    private isPointInsideCanvas(x: number, y: number): boolean {
        return x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height;
    }
}