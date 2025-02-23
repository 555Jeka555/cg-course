export interface ImagePosition {
    image: HTMLImageElement;
    x: number;
    y: number;
}

export interface IObserver {
    update(images: Array<ImagePosition>)
}

export interface IObservable {
    addObserver(observer: IObserver): void

    notifyListeners(): void

    removeObserver(): void
}