interface ImagePosition {
    image: HTMLImageElement;
    x: number;
    y: number;
}

interface Line {
    lastPosition: Position,
    position: Position,
    drawingColor: string,
    brushSize: number,
}

interface Position {
    x: number;
    y: number;
}


interface IObserver {
    update(images: Array<ImagePosition>, lines: Array<Line>)
}

interface IObservable {
    addObserver(observer: IObserver): void

    notifyListeners(): void

    removeObserver(): void
}

class ImageDocument implements IObservable {
    private readonly INIT_POSITION_X = window.innerWidth / 3 - 100;
    private readonly INIT_POSITION_Y = window.innerHeight / 3 - 100;
    private readonly width: number = 0;
    private readonly height: number = 0;
    private images: Array<ImagePosition> = [];
    private lines: Array<Line> = [];
    private isDrawing: boolean = false;
    private drawingColor: string = '#000000';
    private brushSize: number = 5;
    private lastX: number = 0;
    private lastY: number = 0;
    private observers: Array<IObserver> = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public setDrawingColor(drawingColor: string): void {
        this.drawingColor = drawingColor;
    }

    public loadImage(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                this.images.push({image: img, x: this.INIT_POSITION_X, y: this.INIT_POSITION_Y});
                this.notifyListeners();
            };
        };
        reader.readAsDataURL(file);
    }

    public createNewImage(): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.width, this.height);

        const img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
            this.lines = [];
            this.images.push({image: img, x: this.INIT_POSITION_X, y: this.INIT_POSITION_Y});
            this.notifyListeners();
        };
    }

    public startDrawing(x: number, y: number): void {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
    }

    public draw(x: number, y: number): void {
        if (this.isDrawing) {
            if (x < this.INIT_POSITION_X || y < this.INIT_POSITION_Y || x > this.INIT_POSITION_X + this.width || y > this.INIT_POSITION_Y + this.height) {
                this.lastX = x;
                this.lastY = y;
                return;
            }

            this.lines.push({
                    lastPosition: {
                        x: this.lastX,
                        y: this.lastY,
                    },
                    position: {
                        x: x,
                        y: y,
                    },
                    drawingColor: this.drawingColor,
                    brushSize: this.brushSize,
                },
            );
            this.notifyListeners();

            this.lastX = x;
            this.lastY = y;
        }
    }

    public endDrawing(): void {
        this.isDrawing = false;
    }

    public isDraw(): boolean {
        return this.isDrawing && this.images.length > 0;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getInitX(): number {
        return this.INIT_POSITION_X;
    }

    public getInitY(): number {
        return this.INIT_POSITION_Y;
    }

    addObserver(observer: IObserver): void {
        this.observers.push(observer)
    }

    removeObserver(): void {
        this.observers = []
    }

    notifyListeners(): void {
        this.observers.forEach(observer =>
            observer.update(this.images, this.lines)
        )
    }
}

class ImageView implements IObserver {
    private readonly canvas: HTMLCanvasElement;
    private readonly height: number;
    private readonly width: number;
    private readonly ctx: CanvasRenderingContext2D;
    private document: ImageDocument;
    private buttons: Array<{ text: string; x: number; y: number; width: number; height: number; action: () => void }>;

    constructor(width: number, height: number, canvas: HTMLCanvasElement, documentImage: ImageDocument) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.document = documentImage;

        this.initButtons();

        this.setupCanvas();

        this.render();
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getButtons(): Array<{
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
        action: () => void
    }> {
        return this.buttons;
    }

    public getCtx(): CanvasRenderingContext2D {
        return this.ctx;
    }

    private initButtons(): void {
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

    private render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCheckerboard();

        this.drawButtons();
    }

    private renderLines(line: Line): void {
        this.ctx.strokeStyle = line.drawingColor;
        this.ctx.lineWidth = line.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(line.lastPosition.x, line.lastPosition.y);
        this.ctx.lineTo(line.position.x, line.position.y);
        this.ctx.stroke();

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

    private saveImage(name: string): void {
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

    update(images: Array<ImagePosition>, lines: Array<Line>): void {
        this.render();
        images.forEach(img => this.ctx.drawImage(img.image, img.x, img.y));
        lines.forEach(line => this.renderLines(line))
    }
}

class ImageController {
    private model: ImageDocument;
    private view: ImageView;

    constructor(model: ImageDocument, view: ImageView) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.view.getCanvas().addEventListener('click', (e) => {
            const rect = this.view.getCanvas().getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            for (const button of this.view.getButtons()) {
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