class Labyrinth {
    size: number
    map: number[][] = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 2, 2, 0, 4, 4, 0, 3, 3, 0, 5, 5, 0, 0, 1],
        [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 6, 1],
        [1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 6, 1],
        [1, 6, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 6, 1],
        [1, 6, 0, 1, 0, 2, 2, 0, 5, 5, 0, 1, 0, 3, 0, 1],
        [1, 0, 0, 1, 0, 2, 0, 0, 0, 5, 0, 1, 0, 0, 0, 1],
        [1, 0, 4, 0, 0, 0, 0, 1, 0, 0, 0, 0, 4, 0, 1, 1],
        [1, 0, 4, 0, 3, 0, 0, 0, 0, 0, 3, 0, 4, 0, 0, 1],
        [1, 0, 0, 0, 3, 3, 0, 6, 6, 0, 3, 0, 0, 0, 2, 1],
        [1, 2, 0, 5, 0, 0, 0, 6, 6, 0, 0, 0, 5, 0, 2, 1],
        [1, 2, 0, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    constructor() {
        this.size = 16
    }

    isWall(x: number, z: number): boolean {
        const buffer = 0.15;

        const positions = [
            [x + buffer, z],
            [x - buffer, z],
            [x, z + buffer],
            [x, z - buffer],
            [x + buffer, z + buffer],
            [x - buffer, z - buffer],
            [x + buffer, z - buffer],
            [x - buffer, z + buffer]
        ];

        return positions.some(([checkX, checkZ]) => {
            const gridX = Math.floor(checkX);
            const gridZ = Math.floor(checkZ);
            return this.map[gridZ]?.[gridX] !== 0;
        });
    }

}

export {
    Labyrinth,
}