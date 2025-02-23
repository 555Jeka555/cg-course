import { ImageDocument } from "./ImageDocument.ts"
import { ImageView } from "./ImageView.ts"

export class ImageController {
    private model: ImageDocument;
    private view: ImageView;

    constructor(model: ImageDocument, view: ImageView) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.view.getCanvas().addEventListener('mousedown', (e) => {
            const rect = this.view.getCanvas().getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (e.button === 0) {
                this.model.startDrawing(x, y);
            }
        });

        this.view.getCanvas().addEventListener('mousemove', (e) => {
            const rect = this.view.getCanvas().getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.model.isDraw()) {
                this.model.draw(x, y);
            }
        });

        this.view.getCanvas().addEventListener('mouseup', () => {
            this.model.endDrawing();
        });
    }
}