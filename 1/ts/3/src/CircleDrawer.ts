export  class CircleDrawer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    drawCircle(centerX: number, centerY: number, radius: number, color: string) {
        let x = 0;
        let y = radius;
        let d = 3 - 2 * radius;

        this.ctx.fillStyle = color;

        while (y >= x) {
            this.drawCirclePoints(centerX, centerY, x, y);
            x++;

            if (d > 0) {
                y--;
                d = d + 4 * (x - y) + 10;
            } else {
                d = d + 4 * x + 6;
            }
        }
    }

    private drawCirclePoints(cx: number, cy: number, x: number, y: number) {
        this.drawPoint(cx + x, cy + y);
        this.drawPoint(cx - x, cy + y);
        this.drawPoint(cx + x, cy - y);
        this.drawPoint(cx - x, cy - y);
        this.drawPoint(cx + y, cy + x);
        this.drawPoint(cx - y, cy + x);
        this.drawPoint(cx + y, cy - x);
        this.drawPoint(cx - y, cy - x);
    }

    private drawPoint(x: number, y: number) {
        if (this.isPointInsideCanvas(x, y)) {
            this.ctx.fillRect(x, y, 1, 1);
        }
    }

    private isPointInsideCanvas(x: number, y: number): boolean {
        return x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height;
    }
}