export class CircleDrawer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    // TODO Радиус 2px не должен получаться квадрат
    drawCircle(centerX: number, centerY: number, radius: number, color: string, fillColor?: string) {
        if (fillColor) {
            this.fillCircle(centerX, centerY, radius, fillColor);
        }

        let x = 0;
        let y = radius;
        let d = 3 - 2 * radius; // "разница" (или параметр ошибки)

        this.ctx.strokeStyle = color;

        while (y >= x) {
            this.drawCirclePoints(centerX, centerY, x, y, color);
            x++;

            if (d > 0) { // ошибка превышает порог
                y--;
                d = d + 4 * (x - y) + 10;
            } else { // ошибка не превышает порог
                d = d + 4 * x + 6;
            }
        }
    }

    private fillCircle(centerX: number, centerY: number, radius: number, fillColor: string) {
        this.ctx.fillStyle = fillColor;
        for (let y = -radius; y <= radius; y++) {
            let maxX = Math.sqrt(radius * radius - y * y);
            let startX = Math.round(centerX - maxX);
            let endX = Math.round(centerX + maxX);

            if (startX < 0) startX = 0;
            if (endX > this.canvas.width) endX = this.canvas.width;

            for (let x = startX; x <= endX; x++) {
                let pointY = centerY + y;
                if (pointY >= 0 && pointY < this.canvas.height) {
                    this.ctx.fillRect(x, pointY, 1, 1);
                }
            }
        }
    }

    private drawCirclePoints(cx: number, cy: number, x: number, y: number, color: string) {
        this.drawPoint(cx + x, cy + y, color);
        this.drawPoint(cx - x, cy + y, color);
        this.drawPoint(cx + x, cy - y, color);
        this.drawPoint(cx - x, cy - y, color);
        this.drawPoint(cx + y, cy + x, color);
        this.drawPoint(cx - y, cy + x, color);
        this.drawPoint(cx + y, cy - x, color);
        this.drawPoint(cx - y, cy - x, color);
    }

    private drawPoint(x: number, y: number, color: string) {
        if (this.isPointInsideCanvas(x, y)) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }

    private isPointInsideCanvas(x: number, y: number): boolean {
        return x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height;
    }
}
