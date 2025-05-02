import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Инициализация сцены
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// Камера
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Мягкие тени
document.body.appendChild(renderer.domElement);

// Контроллер
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Источник света с тенями
const light = new THREE.PointLight(0xffffff, 100, 100);
light.position.set(5, 8, 5);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.bias = -0.001;
scene.add(light);

// Вспомогательные элементы
const lightHelper = new THREE.PointLightHelper(light);
scene.add(lightHelper);
const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

// Материал с расширенными свойствами
class CustomMaterial extends THREE.MeshStandardMaterial {
    private ambientColor: THREE.Color;
    private specularColor: THREE.Color;
    private shininess: number;

    constructor(params) {
        super(params);
        this.ambientColor = params.ambientColor || new THREE.Color(0xffffff);
        this.specularColor = params.specularColor || new THREE.Color(0x111111);
        this.shininess = params.shininess || 30;
    }
}

// Создаем объекты сцены
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new CustomMaterial({
        color: 0xff0000,
        ambientColor: 0x00ff00,
        specularColor: 0xffffff,
        shininess: 100,
        roughness: 0.1,
        metalness: 0.5
    })
);
sphere.position.set(-2, 1, 0);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new CustomMaterial({
        color: 0x00ff00,
        ambientColor: 0x0000ff,
        specularColor: 0xffffff,
        shininess: 50,
        roughness: 0.3,
        metalness: 0.3
    })
);
cube.position.set(2, 1, 0);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

// Плоскость
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.2
    })
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

// Кастомный шейдер для мягких теней
const shadowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        lightPos: { value: light.position },
        lightColor: { value: light.color },
        lightIntensity: { value: light.intensity },
        shadowMap: { value: light.shadow.map },
        shadowMatrix: { value: light.shadow.matrix },
        shadowRadius: { value: 0.5 },
        samples: { value: 16 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        varying vec4 vShadowCoord;
        
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vShadowCoord = shadowMatrix * worldPosition;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 lightPos;
        uniform vec3 lightColor;
        uniform float lightIntensity;
        uniform sampler2D shadowMap;
        uniform mat4 shadowMatrix;
        uniform float shadowRadius;
        uniform int samples;
        
        varying vec3 vWorldPosition;
        varying vec4 vShadowCoord;
        
        float random(vec2 seed) {
            return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453;
        }
        
        float calculateShadow() {
            vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;
            shadowCoord = shadowCoord * 0.5 + 0.5;
            
            if (shadowCoord.z > 1.0 || shadowCoord.z < 0.0) {
                return 1.0;
            }
            
            float sum = 0.0;
            float radius = shadowRadius;
            
            for (int i = 0; i < samples; i++) {
                float angle = float(i) * 3.14159 * 2.0 / float(samples);
                vec2 offset = vec2(cos(angle), sin(angle)) * radius;
                vec2 sampleCoord = shadowCoord.xy + offset;
                
                float depth = texture2D(shadowMap, sampleCoord).x;
                if (shadowCoord.z - 0.005 > depth) {
                    sum += 1.0;
                }
            }
            
            return 1.0 - (sum / float(samples));
        }
        
        void main() {
            float shadow = calculateShadow();
            vec3 lightDir = normalize(lightPos - vWorldPosition);
            float diff = max(dot(vec3(0,1,0), lightDir), 0.0);
            
            vec3 result = lightColor * diff * lightIntensity * shadow;
            gl_FragColor = vec4(result, 1.0);
        }
    `
});

// Анимация
function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.y += 0.01;
    cube.rotation.x += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

// Обработка изменения размера
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();