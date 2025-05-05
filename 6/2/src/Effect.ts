import * as THREE from "three";
import { Vector3 } from "three";

export class Effect {
    public mesh: THREE.Group;

    private position: Vector3;
    private lifetime: number = 1000;
    private birthTime: number = Date.now();

    constructor(position: Vector3) {
        this.position = position;
        this.mesh = this.createEffect();
    }

    private createEffect(): THREE.Group {
        const group = new THREE.Group();

        // Частицы взрыва
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
            sizes[i] = Math.random() * 0.5 + 0.1;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff6600,
            size: 0.2,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        group.add(particleSystem);

        // Свет от взрыва
        const light = new THREE.PointLight(0xff6600, 2, 5, 2);
        group.add(light);

        group.position.copy(this.position);
        return group;
    }

    public update(): boolean {
        const elapsed = Date.now() - this.birthTime;
        const progress = elapsed / this.lifetime;

        this.mesh.children.forEach(child => {
            if (child instanceof THREE.Points) {
                const material = child.material as THREE.PointsMaterial;
                material.opacity = 1 - progress;
                material.size = 0.2 * (1 - progress);
            } else if (child instanceof THREE.PointLight) {
                child.intensity = 2 * (1 - progress);
            }
        });

        return progress >= 1;
    }
}