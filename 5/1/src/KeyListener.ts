class KeyListener {
    private keys: { [key: string]: boolean } = {}

    constructor() {
        window.addEventListener('keydown', this.handleKeyDown)
        window.addEventListener('keyup', this.handleKeyUp)
    }

    public IsDown(key: string): boolean {
        return this.keys[key]
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keys[event.key] = true
    }

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keys[event.key] = false
    }
}

export {
    KeyListener
}