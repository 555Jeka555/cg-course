import {SceneManager} from "./SceneManager.ts";
import {Vector3} from "three/src/math/Vector3";

export class App {
    private sceneManager: SceneManager = new SceneManager();

    constructor() {
        this.sceneManager.loadModel(
            '../models/swingingswing.glb',
            true,
            new Vector3(0, -10, 0),
            new Vector3(1, 1, 1),
        );
        this.sceneManager.loadModel(
            '../models/chevrolet.glb',
            false,
            new Vector3(10, 0, 0),
            new Vector3(1, 1, 1),
        );
        this.sceneManager.loadModel(
            '../models/deLorean.glb',
            false,
            new Vector3(20, 0, 0),
            new Vector3(1, 1, 1),
        );
        this.sceneManager.loadModel(
            '../models/farm_house.glb',
            false,
            new Vector3(30, 0, 0),
            new Vector3(0.1, 0.1, 0.1),
        );
        this.sceneManager.loadModel(
            '../models/hedge_green_fence.glb',
            false,
            new Vector3(40, 0, 0),
            new Vector3(0.05, 0.05, 0.05),
        );
        this.sceneManager.loadModel(
            '../models/maple_tree.glb',
            false,
            new Vector3(50, 0, 0),
            new Vector3(0.01, 0.01, 0.01),
        );
        this.sceneManager.loadModel(
            '../models/porsche_911.glb',
            false,
            new Vector3(60, 0, 0),
            new Vector3(1, 1, 1),
        );
    }

    public run() {
        this.sceneManager.animate()
    }
}