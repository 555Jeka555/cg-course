import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'; // Измененный загрузчик

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Контроллер камеры
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

const mixers: THREE.AnimationMixer[] = [];

// Загрузка модели GLB
const gltfLoader = new GLTFLoader(); // Используем GLTFLoader вместо OBJLoader

gltfLoader.load(
    '../models/swingingswing.glb', // Изменяем расширение файла
    (gltf) => {
        const object = gltf.scene; // GLTF-модель содержится в gltf.scene
        object.position.y = -1;
        scene.add(object);

        // Включение теней для всех мешей в модели
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Автоматическое центрирование камеры
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        camera.near = size / 100;
        camera.far = size * 100;
        camera.updateProjectionMatrix();

        camera.position.copy(center);
        camera.position.x += size * 0.5;
        camera.position.y += size * 0.5;
        camera.position.z += size * 0.5;
        camera.lookAt(center);

        controls.target.copy(center);
        controls.update();

        // Если модель содержит анимации
        if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(object);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
            mixers.push(mixer);
        }
    },
    undefined, // Функция прогресса загрузки (опционально)
    (error) => {
        console.error('Error loading GLB model:', error);
    }
);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    mixers.forEach(mixer => mixer.update(delta));

    controls.update();
    renderer.render(scene, camera);
}
animate();