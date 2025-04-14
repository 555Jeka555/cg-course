class Maze {
    size: number
    grid: number[][]

    constructor() {
        this.size = 16
        this.grid = this.getFixedMaze()
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
            return this.grid[gridZ]?.[gridX] === 1;
        });
    }

    private getFixedMaze(): number[][] {
        return [
            [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    }
}

export {
    Maze,
}