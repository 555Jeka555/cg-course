import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class ModelLoader {
    public static async loadModel(url: string): Promise<THREE.Group> {
        return new Promise<THREE.Group>((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                url,
                (gltf: GLTF) => {
                    const model = gltf.scene;

                    model.traverse((child: THREE.Object3D) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    resolve(model);
                },
                undefined,
                (error: ErrorEvent) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }
}