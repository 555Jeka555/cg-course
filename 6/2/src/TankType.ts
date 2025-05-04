export class TankType {
    constructor(
        public type: string,
        public speed: number,
        public shootCooldown: number,
        public health: number,
    ) {
    }
}