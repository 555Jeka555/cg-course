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
        this.camera.position.set(3, 5, 6);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.engine = new Engine();
        this.engine.addToScene(this.scene);

        this.setupControls(); // Настройка слайдеров
        this.animate();
        this.setupResizeListener();
    }

    private setupControls(): void {
        const xSlider = document.getElementById('x-slider') as HTMLInputElement;
        const ySlider = document.getElementById('y-slider') as HTMLInputElement;
        const zSlider = document.getElementById('z-slider') as HTMLInputElement;

        const rxSlider = document.getElementById('rx-slider') as HTMLInputElement;
        const rySlider = document.getElementById('ry-slider') as HTMLInputElement;
        const rzSlider = document.getElementById('rz-slider') as HTMLInputElement;

        const xValue = document.getElementById('x-value') as HTMLSpanElement;
        const yValue = document.getElementById('y-value') as HTMLSpanElement;
        const zValue = document.getElementById('z-value') as HTMLSpanElement;

        const rxValue = document.getElementById('rx-value') as HTMLSpanElement;
        const ryValue = document.getElementById('ry-value') as HTMLSpanElement;
        const rzValue = document.getElementById('rz-value') as HTMLSpanElement;

        xSlider.addEventListener('input', () => {
            this.camera.position.x = parseFloat(xSlider.value);
            xValue.textContent = xSlider.value;
        });

        ySlider.addEventListener('input', () => {
            this.camera.position.y = parseFloat(ySlider.value);
            yValue.textContent = ySlider.value;
        });

        zSlider.addEventListener('input', () => {
            this.camera.position.z = parseFloat(zSlider.value);
            zValue.textContent = zSlider.value;
        });

        // Обработчики событий для слайдеров поворота
        rxSlider.addEventListener('input', () => {
            const angle = THREE.MathUtils.degToRad(parseFloat(rxSlider.value));
            this.camera.rotation.x = angle;
            rxValue.textContent = rxSlider.value;
        });

        rySlider.addEventListener('input', () => {
            const angle = THREE.MathUtils.degToRad(parseFloat(rySlider.value));
            this.camera.rotation.y = angle;
            ryValue.textContent = rySlider.value;
        });

        rzSlider.addEventListener('input', () => {
            const angle = THREE.MathUtils.degToRad(parseFloat(rzSlider.value));
            this.camera.rotation.z = angle;
            rzValue.textContent = rzSlider.value;
        });
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

new SceneManager();