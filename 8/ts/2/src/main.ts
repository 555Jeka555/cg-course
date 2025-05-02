import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Инициализация сцены, камеры и рендерера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Для мягких теней
document.body.appendChild(renderer.domElement);

// Настройка камеры
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Контроллер для вращения сцены
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Создаем источник света с дополнительными свойствами
class ExtendedPointLight extends THREE.PointLight {
    specularColor: THREE.Color;
    ambientColor: THREE.Color;
    radius: number;

    constructor(
        color?: THREE.ColorRepresentation,
        intensity?: number,
        distance?: number,
        decay?: number,
        specularColor?: THREE.Color,
        ambientColor?: THREE.Color,
        radius?: number
    ) {
        super(color, intensity, distance, decay);
        this.specularColor = specularColor || new THREE.Color(0xffffff);
        this.ambientColor = ambientColor || new THREE.Color(0x111111);
        this.radius = radius || 1.0;
    }

    copy(source: ExtendedPointLight): this {
        super.copy(source);
        this.specularColor.copy(source.specularColor);
        this.ambientColor.copy(source.ambientColor);
        this.radius = source.radius;
        return this;
    }
}

const light: ExtendedPointLight = new ExtendedPointLight(0xffffff, 20, 100);
light.position.set(5, 8, 5);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.bias = -0.001;

// Добавляем свойства для модели Фонга
light.specularColor = new THREE.Color(0xffffff);
light.ambientColor = new THREE.Color(0x111111);
light.radius = 1.0; // Размер источника для мягких теней

scene.add(light);

// Вспомогательная визуализация источника света
const lightHelper = new THREE.PointLightHelper(light);
scene.add(lightHelper);

// Создаем материал с расширенными свойствами
interface ExtendedMeshPhongMaterial extends THREE.MeshPhongMaterial {
    ambientColor?: THREE.Color;
    shininess?: number;
}

const material: ExtendedMeshPhongMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    specular: 0x111111,
    shininess: 100
});

// Добавляем свойства для модели Фонга
material.ambientColor = new THREE.Color(0x00ff00);

// Создаем объекты сцены
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    material.clone()
);
sphere.position.set(-2, 1, 0);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    material.clone()
);
cube.position.set(2, 1, 0);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

// Кастомный шейдерный материал для реализации модели Фонга и мягких теней
const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
        projectionMatrix: { value: new THREE.Matrix4() },
        modelViewMatrix: { value: new THREE.Matrix4() },
        modelMatrix: { value: new THREE.Matrix4() },
        normalMatrix: { value: new THREE.Matrix3() },

        lightPosition: { value: light.position },
        lightColor: { value: new THREE.Color(light.color) },
        lightSpecular: { value: light.specularColor },
        lightAmbient: { value: light.ambientColor },
        lightRadius: { value: light.radius },
        lightIntensity: { value: light.intensity },
        materialDiffuse: { value: new THREE.Color(material.color) },
        materialSpecular: { value: new THREE.Color(material.specular) },
        materialAmbient: { value: material.ambientColor },
        materialShininess: { value: material.shininess },
        shadowMap: { value: light.shadow.map },
        shadowMatrix: { value: light.shadow.matrix },
        shadowBias: { value: light.shadow.bias },
        shadowRadius: { value: 1.0 },
        shadowMapSize: { value: new THREE.Vector2(2048, 2048) }
    },
    vertexShader: `
    uniform mat4 shadowMatrix;
    
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec4 vShadowCoord;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      
      vWorldPosition = worldPosition.xyz;
      vShadowCoord = shadowMatrix * worldPosition;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 lightPosition;
    uniform vec3 lightColor;
    uniform vec3 lightSpecular;
    uniform vec3 lightAmbient;
    uniform float lightRadius;
    uniform float lightIntensity;
    
    uniform vec3 materialDiffuse;
    uniform vec3 materialSpecular;
    uniform vec3 materialAmbient;
    uniform float materialShininess;
    
    uniform sampler2D shadowMap;
    uniform mat4 shadowMatrix;
    uniform float shadowBias;
    uniform float shadowRadius;
    uniform vec2 shadowMapSize;
    
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec4 vShadowCoord;
    
    // Функция проверки видимости с учетом мягких теней
    float getShadow() {
      vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;
      shadowCoord = shadowCoord * 0.5 + 0.5;
      
      if (shadowCoord.z > 1.0 || shadowCoord.z < 0.0) {
        return 1.0;
      }
      
      float sum = 0.0;
      int samples = 16;
      float radius = 0.01;
      
      for (int i = 0; i < samples; i++) {
        // Простая реализация сэмплирования
        float angle = float(i) * 3.14159 * 2.0 / float(samples);
        vec2 offset = vec2(cos(angle), sin(angle)) * radius;
        vec2 sampleCoord = shadowCoord.xy + offset;
        
        float depth = texture2D(shadowMap, sampleCoord).x;
        if (shadowCoord.z - shadowBias > depth) {
          sum += 1.0;
        }
      }
      
      return 1.0 - (sum / float(samples));
    }
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(lightPosition - vWorldPosition);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 reflectDir = reflect(-lightDir, normal);
      
      // Фоновая составляющая
      vec3 ambient = lightAmbient * materialAmbient;
      
      // Диффузная составляющая
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = diff * lightColor * materialDiffuse;
      
      // Зеркальная составляющая (модель Фонга)
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), materialShininess);
      vec3 specular = spec * lightSpecular * materialSpecular;
      
      // Проверка тени
      float shadow = getShadow();
      
      // Увеличиваем интенсивность освещения
      vec3 result = ambient + shadow * (diffuse * 2.0 + specular * 1.5);
  
      // Добавляем базовый цвет материала
      vec3 finalColor = result * materialDiffuse;
  
      // Повышаем общую яркость
      finalColor = pow(finalColor, vec3(1.0/2.2)); // Гамма-коррекция
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
});

// Применяем кастомный материал к объектам
sphere.material = customMaterial.clone() as unknown as ExtendedMeshPhongMaterial;
cube.material = customMaterial.clone() as unknown as ExtendedMeshPhongMaterial;

// Анимация
function animate() {
    requestAnimationFrame(animate);

    // Вращение объектов
    sphere.rotation.y += 0.01;
    cube.rotation.x += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});