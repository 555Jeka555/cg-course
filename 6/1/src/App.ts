import {SceneManager} from "./SceneManager.ts";
import {Vector3} from "three/src/math/Vector3";

export class App {
    private sceneManager: SceneManager = new SceneManager();

    constructor() {
        this.sceneManager.loadModel(
            '../models/swingingswing.glb',
            true,
            new Vector3(30, -5, -10),
            new Vector3(0.45, 0.45, 0.45),
        );
        this.sceneManager.loadModel(
            '../models/chevrolet.glb',
            false,
            new Vector3(10, -11.5, -15),
            new Vector3(0.65, 0.65, 0.65),
        );
        this.sceneManager.loadModel(
            '../models/deLorean.glb',
            false,
            new Vector3(20, -5, 0),
            new Vector3(1, 1, 1),
        );
        this.sceneManager.loadModel(
            '../models/farm_house.glb',
            false,
            new Vector3(30, 1.3, 0),
            new Vector3(0.13, 0.13, 0.13),
        );

        this.sceneManager.loadFence(
            '../models/hedge_green_fence.glb',
            [
                new Vector3(-6, -4, -0.3),
                new Vector3(10, -4, -31),
                new Vector3(23.5, -4, -31),
                new Vector3(55.5, -4, -15),
                new Vector3(55.5, -4, -1.5),
                new Vector3(40, -4, 30.5),
                new Vector3(26.5, -4, 30.5),
            ],
            [
                new Vector3(0, this.degToRad(0), 0),
                new Vector3(0, this.degToRad(270), 0),
                new Vector3(0, this.degToRad(270), 0),
                new Vector3(0, this.degToRad(180), 0),
                new Vector3(0, this.degToRad(180), 0),
                new Vector3(0, this.degToRad(90), 0),
                new Vector3(0, this.degToRad(90), 0),
            ],
            new Vector3(0.02, 0.02, 0.02),
        );

        this.sceneManager.loadModel(
            '../models/maple_tree.glb',
            false,
            new Vector3(30, -4.9, 10),
            new Vector3(0.02, 0.02, 0.02),
        );
        this.sceneManager.loadModel(
            '../models/porsche_911.glb',
            false,
            new Vector3(20, -4.3, 10),
            new Vector3(1.1, 1.1, 1.1),
        );
    }

    public run() {
        this.sceneManager.animate()
    }

    private degToRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}