import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Vector3} from "three/src/math/Vector3";

export class SceneManager {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private mixers: THREE.AnimationMixer[] = [];
    private clock: THREE.Clock = new THREE.Clock();

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.initScene();
        this.initRenderer();
        this.initControls();
        this.initLights();
    }

    private initScene(): void {
        this.scene.background = new THREE.Color(0x87CEEB);
        this.addGroundPlane();
    }

    private initRenderer(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
    }

    private initControls(): void {
        this.controls.enableDamping = true;
    }

    private initLights(): void {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    private addGroundPlane(): void {
        const textureLoader = new THREE.TextureLoader();

        const grassTexture = textureLoader.load('textures/grass.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;

        const asphaltTexture = textureLoader.load('textures/asphalt.jpg'); // путь к текстуре асфальта
        asphaltTexture.wrapS = THREE.RepeatWrapping;
        asphaltTexture.wrapT = THREE.RepeatWrapping;

        const groundMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 1.0,
            metalness: 0.0
        });

        const asphaltMaterial = new THREE.MeshStandardMaterial({
            map: asphaltTexture,
            roughness: 0.8,
            metalness: 0.2
        });

        const groundGeometry = new THREE.PlaneGeometry(30, 30);
        const asphaltGeometry = new THREE.PlaneGeometry(50, 50);

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.position.y = -5;
        ground.position.x = 25;

        const asphalt = new THREE.Mesh(asphaltGeometry, asphaltMaterial);
        asphalt.rotation.x = -Math.PI / 2;
        asphalt.receiveShadow = true;
        asphalt.position.y = -5.1;
        asphalt.position.x = 25;

        this.scene.add(asphalt);
        this.scene.add(ground);
    }

    public loadModel(
        url: string,
        hasAnimation: boolean,
        position: Vector3,
        scale: Vector3
    ): void {
        const loader = new GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                const model = gltf.scene;

                model.position.copy(position);
                model.scale.copy(scale);

                this.scene.add(model);

                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.centerCameraOnObject(model);

                if (hasAnimation && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                    this.mixers.push(mixer);
                }
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }

    public loadFence(
        url: string,
        positions: Vector3[],
        rotations: Vector3[],
        scale: Vector3
    ): void {
        const loader = new GLTFLoader();

        positions.forEach((position: Vector3, index: number) => {
            loader.load(
                url,
                (gltf) => {
                    const rotation = rotations[index]

                    const model = gltf.scene;

                    model.position.copy(position);
                    model.rotation.set(rotation.x, rotation.y, rotation.z);
                    model.scale.copy(scale);

                    this.scene.add(model);

                    model.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    this.centerCameraOnObject(model);
                },
                undefined,
                (error) => {
                    console.error('Error loading model:', error);
                }
            );
        });
    }

    private centerCameraOnObject(object: THREE.Object3D): void {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        this.camera.near = size / 100;
        this.camera.far = size * 100;
        this.camera.updateProjectionMatrix();

        this.camera.position.copy(center);
        this.camera.position.x += size * 0.5;
        this.camera.position.y += size * 0.5;
        this.camera.position.z += size * 0.5;
        this.camera.lookAt(center);

        this.controls.target.copy(center);
        this.controls.update();
    }

    public animate(): void {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.mixers.forEach(mixer => mixer.update(delta));

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}