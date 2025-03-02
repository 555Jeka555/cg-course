import { IObservable, ImagePosition, Line, IObserver } from "./types.ts"

// TODO Ластик добавить
// TODO Рисовать на прозрачности
export class ImageDocument implements IObservable {
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
