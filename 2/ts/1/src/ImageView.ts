import { IObserver, ImagePosition  } from "./types.ts"
import { ImageDocument } from "./ImageDocument.ts"

export class ImageView implements IObserver {
    private readonly width: number;
    private readonly height: number;
    private readonly canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private document: ImageDocument;
    private openFileButton: HTMLButtonElement;

    constructor(width: number, height: number, canvas: HTMLCanvasElement, imageDocument: ImageDocument) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.document = imageDocument;

        this.openFileButton = document.getElementById('openFileButton') as HTMLButtonElement;

        this.setupCanvas();

        this.openFileButton.addEventListener('click', () => {
            this.openFileDialog();
        });

        this.render();
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCheckerboard();
    }

    public openFileDialog(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.png,.jpg,.jpeg,.bmp';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                this.document.loadImage(file);
            }
        };
        input.click();
    }

    private setupCanvas(): void {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        window.addEventListener('resize', () => {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.render();
        });
    }

    private drawCheckerboard(): void {
        const size = 20;
        for (let i = 0; i < this.canvas.width; i += size) {
            for (let j = 0; j < this.canvas.height; j += size) {
                this.ctx.fillStyle = (i + j) % (size * 2) === 0 ? '#ccc' : '#fff';
                this.ctx.fillRect(i, j, size, size);
            }
        }
    }

    public update(images: Array<ImagePosition>) {
        this.render();
        images.forEach(img => this.ctx.drawImage(img.image, img.x, img.y));
    }
}