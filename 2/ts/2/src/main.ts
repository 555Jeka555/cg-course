import { ImageDocument } from "./ImageDocument.ts"
import { ImageView } from "./ImageView.ts"
import { ImageController } from "./ImageController.ts"

function main(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const colorPicker = document.getElementById('color-picker') as HTMLInputElement;

    if (canvas && colorPicker) {
        const imageDocument = new ImageDocument(800, 600);
        const view = new ImageView(window.innerWidth, window.innerHeight, canvas, imageDocument);
        imageDocument.addObserver(view)
        new ImageController(imageDocument, view);
    } else {
        console.error("Canvas or color picker element not found!");
    }
}

main();