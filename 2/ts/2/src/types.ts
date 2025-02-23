export interface ImagePosition {
    image: HTMLImageElement;
    x: number;
    y: number;
}

export interface Line {
    lastPosition: Position,
    position: Position,
    drawingColor: string,
    brushSize: number,
}

export interface Position {
    x: number;
    y: number;
}

export interface IObserver {
    update(images: Array<ImagePosition>, lines: Array<Line>)
}

export interface IObservable {
    addObserver(observer: IObserver): void

    notifyListeners(): void

    removeObserver(): void
}