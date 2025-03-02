import { ElementController } from "./Controller/ElementController.ts"
import { ElementCreator } from "./Model/ElementCreator.ts";
import { ElementStore } from "./Model/ElementStore.ts";

function main(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (canvas) {
        const elementStore = new ElementStore(800, 600, 50, 50);
        new ElementController(elementStore);
    } else {
        console.error("Canvas or color picker element not found!");
    }
}

main();