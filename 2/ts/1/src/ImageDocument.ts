import { IObserver, ImagePosition, IObservable  } from "./types.ts"

export class ImageDocument implements IObservable {
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
            observer.update(this.images)
        )
    }
}