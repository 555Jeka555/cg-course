// TODO Распилить на файлы
// TODO Сделать модель активной, а не пассивной

interface ImagePosition {
    image: HTMLImageElement;
    x: number;
    y: number;
}

interface IObserver {
    update(images: Array<ImagePosition>)
}

interface IObservable {
    addObserver(observer: IObserver)

    notifyListeners(): void

    removeObserver()
}

class ImageDocument implements IObservable {
    private images: Array<ImagePosition> = [];
    private isDragging: boolean = false;
    private dragStart: { x: number; y: number } = {x: 0, y: 0};
    private draggedImageIndex: number | null = null;
    private observers: Array<IObserver> = [];

    loadImage(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                this.images.push({image: img, x: 0, y: 0});
                this.notifyListeners();
            };
        };
        reader.readAsDataURL(file);
    }

    startDrag(x: number, y: number): void {
        for (let i = this.images.length - 1; i >= 0; i--) {
            const img = this.images[i];
            const imgWidth = img.image.width;
            const imgHeight = img.image.height;

            if (
                x >= img.x &&
                x <= img.x + imgWidth &&
                y >= img.y &&
                y <= img.y + imgHeight
            ) {
                this.isDragging = true;
                this.draggedImageIndex = i;
                this.dragStart.x = x - img.x;
                this.dragStart.y = y - img.y;
                break;
            }
        }
    }

    drag(x: number, y: number): void {
        if (this.isDragging && this.draggedImageIndex !== null) {
            const img = this.images[this.draggedImageIndex];
            img.x = x - this.dragStart.x;
            img.y = y - this.dragStart.y;
            this.notifyListeners();
        }
    }

    endDrag(): void {
        this.isDragging = false;
        this.draggedImageIndex = null;
    }

    isDrag(): boolean {
        return this.isDragging;
    }

    addObserver(observer: IObserver): void {
        this.observers.push(observer)
    }

    removeObserver(): void {
        this.observers = []
    }

    notifyListeners(): void {
        this.observers.forEach(observer =>
            observer.update(this.images
            )
        )
    }
}

class ImageView implements IObserver {
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

        // Находим кнопку по ID
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

class ImageController {
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
            this.model.startDrag(x, y);
        });

        this.view.getCanvas().addEventListener('mousemove', (e) => {
            if (this.model.isDrag()) {
                const rect = this.view.getCanvas().getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.model.drag(x, y);
            }
        });

        this.view.getCanvas().addEventListener('mouseup', () => {
            this.model.endDrag();
        });

    }
}


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