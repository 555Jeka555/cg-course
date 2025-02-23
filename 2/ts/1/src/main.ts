import { ImageDocument } from "./ImageDocument.ts"
import { ImageView } from "./ImageView.ts"
import { ImageController } from "./ImageController.ts"

// TODO Распилить на файлы
// TODO Сделать модель активной, а не пассивной

function main(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (canvas) {
        const document = new ImageDocument();
        const view = new ImageView(window.innerWidth, window.innerHeight, canvas, document);
        document.addObserver(view)
        new ImageController(document, view);
    } else {
        console.error("Canvas element not found!");
    }
}

main();