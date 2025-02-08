import { Letter } from "./Letter"
import { ELetterDrawStrategy } from "./ELetterDrawStrategy";
import { VLetterDrawStrategy } from "./VLetterDrawStrategy";
import { ALetterDrawStrategy } from "./ALetterDrawStrategy";


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

    const letters: Letter[] = [
        new Letter(new ELetterDrawStrategy(), 50, 'red', 0),
        new Letter(new VLetterDrawStrategy(), 120, 'green', 200),
        new Letter(new ALetterDrawStrategy(), 190, 'blue', 400),
    ]

    function animate() {
        if (!ctx) {
            console.error("2D context not supported or canvas not properly initialized!");
            return;
        }

        const currentTime = Date.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        letters.forEach(letter => {
            letter.draw(ctx, currentTime);
        });

        requestAnimationFrame(animate);
    }

    animate();
}

main();