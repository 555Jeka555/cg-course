import * as THREE from 'three';
import { Engine } from './Engine';

export class SceneManager {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private engine: Engine;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(3, 5, 5);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.engine = new Engine();
        this.engine.addToScene(this.scene);

        this.animate();
        this.setupResizeListener();
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.engine.update();
        this.renderer.render(this.scene, this.camera);
    }

    private setupResizeListener(): void {
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        });
    }
}

new SceneManager()