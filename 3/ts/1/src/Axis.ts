import * as THREE from 'three';

export class Axis {
    public xAxis: THREE.Line;
    public yAxis: THREE.Line;
    public ticksX: THREE.Line[];
    public ticksY: THREE.Line[];

    constructor(length: number = 20, tickStep: number = 2) {
        this.xAxis = this.createXAxis(length);
        this.yAxis = this.createYAxis(length);
        this.ticksX = this.createTicksX(length, tickStep);
        this.ticksY = this.createTicksY(length, tickStep);
    }

    private createXAxis(length: number): THREE.Line {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-length, 0, 0),
            new THREE.Vector3(length, 0, 0),
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        return new THREE.Line(geometry, material);
    }

    private createYAxis(length: number): THREE.Line {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -length, 0),
            new THREE.Vector3(0, length, 0),
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        return new THREE.Line(geometry, material);
    }

    private createTicksX(length: number, tickStep: number): THREE.Line[] {
        const ticks: THREE.Line[] = [];
        for (let i = -length; i <= length; i += tickStep) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, -0.1, 0),
                new THREE.Vector3(i, 0.1, 0),
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const tick = new THREE.Line(geometry, material);
            ticks.push(tick);
        }
        return ticks;
    }

    private createTicksY(length: number, tickStep: number): THREE.Line[] {
        const ticks: THREE.Line[] = [];
        for (let i = -length; i <= length; i += tickStep) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-0.1, i, 0),
                new THREE.Vector3(0.1, i, 0),
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            const tick = new THREE.Line(geometry, material);
            ticks.push(tick);
        }
        return ticks;
    }
}