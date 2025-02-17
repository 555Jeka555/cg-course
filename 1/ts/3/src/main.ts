import './style.css'
import { CircleDrawer } from "./CircleDrawer.ts"
import { LineDrawer } from "./LineDrawer.ts"

function main (): void {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement; // Явное указание типа
    if (!canvas) {
        console.error("Canvas element not found!");
        return
    }

    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d"); // Получаем 2D контекст
    if (!ctx) {
        console.error("2D context not supported or canvas not properly initialized!");
        return;
    }

    const circleDrawer = new CircleDrawer(canvas);
    circleDrawer.drawCircle(100, 100, 2, 'blue', 'green');

    const lineDrawer = new LineDrawer(canvas);
    lineDrawer.drawLine(2, 6, 12, 2, 'red');
}

main();
