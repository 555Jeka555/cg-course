import * as THREE from 'three';
import { Piston } from './Piston';
import { Valve } from './Valve';
import { Flash } from './Flash';
import { SparkPLug } from './SparkPLug';
import { ConnectingRod } from './ConnectingRod';
import { Crankshaft } from './Crankshaft';
import { Crankcase } from './Crankcase';
import { CoolingSystem } from './CoolingSystem';

export class Engine {
    private pistons: Piston[] = [];
    private valves: Valve[] = [];
    private sparkPlugs: SparkPLug[] = [];
    private flashes: Flash[] = [];
    private connectingRods: ConnectingRod[] = [];
    private crankshaft: Crankshaft;
    private crankcase: Crankcase;
    private coolingSystems: CoolingSystem[] = [];
    private time: number = 0;

    constructor() {
        const cylinderCount = 4
        const cylinderSpacing = 1.5;

        for (let i = 0; i < cylinderCount; i++) {
            const zOffset = i * cylinderSpacing - (cylinderCount - 1) * cylinderSpacing / 2;

            const piston = new Piston(new THREE.Vector3(0, 0, zOffset));
            this.pistons.push(piston);

            const intakeValve = new Valve(new THREE.Vector3(-0.5, 2.2, zOffset), 0x00ff00);
            const exhaustValve = new Valve(new THREE.Vector3(0.5, 2.2, zOffset), 0xff0000);
            this.valves.push(intakeValve, exhaustValve);

            const flash = new Flash(new THREE.Vector3(0, 2, zOffset));
            this.flashes.push(flash);

            const sparkPlug = new SparkPLug(new THREE.Vector3(0, 2.3, zOffset));
            this.sparkPlugs.push(sparkPlug);

            const connectingRod = new ConnectingRod(new THREE.Vector3(0, 0, zOffset));
            this.connectingRods.push(connectingRod);

            const coolingSystem = new CoolingSystem(new THREE.Vector3(0, 0, zOffset));
            this.coolingSystems.push(coolingSystem);
        }

        this.crankshaft = new Crankshaft(new THREE.Vector3(0, -2, 0));
        this.crankcase = new Crankcase(new THREE.Vector3(0, 0, 0));
    }

    addToScene(scene: THREE.Scene): void {
        this.pistons.forEach(piston => scene.add(piston.mesh));
        this.valves.forEach(valve => scene.add(valve.mesh));
        this.sparkPlugs.forEach(sparkPlug => scene.add(sparkPlug.mesh));
        this.flashes.forEach(flash => scene.add(flash.mesh));
        this.connectingRods.forEach(rod => scene.add(rod.mesh));
        this.coolingSystems.forEach(coolingSystem => scene.add(coolingSystem.mesh));
        scene.add(this.crankshaft.mesh);
        scene.add(this.crankcase.mesh);
    }

    update(): void {
        this.time += 0.01;

        const crankAngle = this.time * 2;
        this.crankshaft.update(crankAngle);

        this.pistons.forEach((piston, index) => {
            const pistonMoveY = Math.sin(this.time + index * Math.PI / 2) * 0.8;
            const pistonY = 0.5;
            piston.move(pistonMoveY + pistonY);

            const rodAngle = Math.sin(this.time + index * Math.PI / 2) * 0.2;

            this.connectingRods[index].update(piston.mesh.position, rodAngle);
        });

        this.valves.forEach((valve, index) => {
            const lift = Math.sin(this.time + index * Math.PI) * 0.0015;
            valve.open(lift);
        });

        this.flashes.forEach((flash, index) => {
            if (Math.sin(this.time + index * Math.PI / 2) > 0.9) {
                flash.ignite();
            } else {
                flash.reset();
            }
        });
    }
}