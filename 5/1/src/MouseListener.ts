class MouseListener {
    private isPointerLocked: boolean = false;
    private callback: (movementX: number) => void;

    constructor(
        callback: (movementX: number) => void,
    ) {
        this.callback = callback;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Активация Pointer Lock при клике
        document.addEventListener('click', this.requestPointerLock);

        // Обработка движения мыши
        document.addEventListener('mousemove', this.handleMouseMovement);

        // Отслеживание состояния Pointer Lock
        document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    }

    private requestPointerLock = () => {
        if (!this.isPointerLocked) {
            const request = document.body.requestPointerLock ||
                (document.body as any).mozRequestPointerLock ||
                (document.body as any).webkitRequestPointerLock;
            request.call(document.body);
        }
    };

    private handleMouseMovement = (e: MouseEvent) => {
        if (document.pointerLockElement === document.body) {
            const movementX = this.getMovementX(e);
            this.callback(movementX);
        }
    };

    private getMovementX(e: MouseEvent): number {
        return e.movementX ||
            (e as any).mozMovementX ||
            (e as any).webkitMovementX ||
            0;
    }

    private handlePointerLockChange = () => {
        this.isPointerLocked = !!document.pointerLockElement;
    };
}

export { MouseListener };