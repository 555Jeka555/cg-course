class ImageDocument {
    private readonly INIT_POSITION_X = window.innerWidth / 3 - 100;
    private readonly INIT_POSITION_Y = window.innerHeight / 3 - 100;
    private readonly width: number = 0;
    private readonly height: number = 0;
    private images: Array<{ image: HTMLImageElement; x: number; y: number }> = [];
    private isDrawing: boolean = false;
    private drawingColor: string = '#000000';
    private brushSize: number = 5;
    private lastX: number = 0;
    private lastY: number = 0;
    private onImageLoaded: (() => void) | null = null;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    setDrawingColor(drawingColor: string): void {
        this.drawingColor = drawingColor;
    }

    setOnImageLoaded(callback: () => void): void {
        this.onImageLoaded = callback;
    }

    loadImage(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                this.images.push({ image: img, x: this.INIT_POSITION_X, y: this.INIT_POSITION_Y });
                if (this.onImageLoaded) {
                    this.onImageLoaded();
                }
            };
        };
        reader.readAsDataURL(file);
    }

    createNewImage(): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.width, this.height);

        const img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
            this.images.push({ image: img, x: this.INIT_POSITION_X, y: this.INIT_POSITION_Y });
            if (this.onImageLoaded) {
                this.onImageLoaded();
            }
        };
    }

    getImages(): Array<{ image: HTMLImageElement; x: number; y: number }> {
        return this.images;
    }

    startDrawing(x: number, y: number): void {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
    }

    draw(x: number, y: number, ctx: CanvasRenderingContext2D): void {
        if (this.isDrawing) {
            if (x < this.INIT_POSITION_X || y < this.INIT_POSITION_Y || x > this.INIT_POSITION_X + this.width || y > this.INIT_POSITION_Y + this.height) {
                this.lastX = x;
                this.lastY = y;
                return;
            }

            ctx.strokeStyle = this.drawingColor;
            ctx.lineWidth = this.brushSize;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.lastX, this.lastY);
            ctx.lineTo(x, y);
            ctx.stroke();

            this.lastX = x;
            this.lastY = y;
        }
    }

    endDrawing(): void {
        this.isDrawing = false;
    }

    isDraw(): boolean {
        return this.isDrawing && this.images.length > 0;
    }

    getWidth(): number {
        return this.width;
    }

    getHeight(): number {
        return this.height;
    }

    getInitX(): number {
        return this.INIT_POSITION_X;
    }

    getInitY(): number {
        return this.INIT_POSITION_Y;
    }
}


class ImageView {
    private readonly canvas: HTMLCanvasElement;
    private readonly height: number;
    private readonly width: number;
    private readonly ctx: CanvasRenderingContext2D;
    private document: ImageDocument;
    private readonly buttons: Array<{ text: string; x: number; y: number; width: number; height: number; action: () => void }>;

    constructor(width: number, height: number, canvas: HTMLCanvasElement, documentImage: ImageDocument) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.document = documentImage;

        this.buttons = [
            {
                text: 'Open File',
                x: 20,
                y: 30,
                width: 80,
                height: 30,
                action: () => this.openFileDialog(),
            },
            {
                text: 'New',
                x: 110,
                y: 30,
                width: 80,
                height: 30,
                action: () => this.document.createNewImage(),
            },
            {
                text: 'Save As',
                x: 200,
                y: 30,
                width: 80,
                height: 30,
                action: () => {
                    const name = prompt('Enter name file:');
                    this.saveImage(name);
                },
            },
            {
                text: 'Choose Color',
                x: 290,
                y: 30,
                width: 100,
                height: 30,
                action: () => {
                    const colorPicker = document.getElementById('color-picker') as HTMLInputElement;
                    colorPicker.click();
                    console.log(colorPicker)
                    colorPicker.addEventListener('input', () => {
                        this.document.setDrawingColor(colorPicker.value);
                    });
                },
            },
        ];

        this.document.setOnImageLoaded(() => this.render());

        this.setupCanvas();
        this.setupEventListeners();
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

    private setupEventListeners(): void {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            for (const button of this.buttons) {
                if (
                    x >= button.x &&
                    x <= button.x + button.width &&
                    y >= button.y &&
                    y <= button.y + button.height
                ) {
                    button.action();
                    break;
                }
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (e.button === 0) {
                this.document.startDrawing(x, y);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.document.isDraw()) {
                this.document.draw(x, y, this.ctx);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.document.endDrawing();
        });
    }

    private openFileDialog(): void {
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

    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCheckerboard();

        this.drawButtons();

        const images = this.document.getImages();
        images.forEach((img) => {
            this.ctx.drawImage(img.image, img.x, img.y);
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

    private drawButtons(): void {
        for (const button of this.buttons) {
            this.ctx.fillStyle = '#007bff';
            this.ctx.fillRect(button.x, button.y, button.width, button.height);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                button.text,
                button.x + button.width / 2,
                button.y + button.height / 2
            );
        }
    }

    saveImage(name: string): void {
        if (this.document.getImages().length > 0) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = this.document.getWidth();
            canvas.height = this.document.getHeight();

            ctx.drawImage(
                this.canvas,
                this.document.getInitX(),
                this.document.getInitY(),
                this.document.getWidth(),
                this.document.getHeight(),
                0,
                0,
                this.document.getWidth(),
                this.document.getHeight(),
            );

            const link = document.createElement('a');
            link.download = `${name}.png`;
            link.href = canvas.toDataURL(`image/png}`);
            link.click();
        }
    }
}

function main(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const colorPicker = document.getElementById('color-picker') as HTMLInputElement;

    if (canvas && colorPicker) {
        const imageDocument = new ImageDocument(800, 600);
        const view = new ImageView(window.innerWidth, window.innerHeight, canvas, imageDocument);

        view.render();
    } else {
        console.error("Canvas or color picker element not found!");
    }
}

main();