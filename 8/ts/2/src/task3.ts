import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
        vNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
`;

const fragmentShader = `
    precision highp float;
    uniform vec3 lightDirection;
    uniform vec3 lightColor;
    uniform vec3 objectColor;
    uniform vec3 ambientColor;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(lightDirection);
        float diff = max(dot(normal, lightDir), 0.0);

        vec3 ambient = ambientColor * objectColor;
        
        vec3 diffuse = diff * lightColor * objectColor;

        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 specular = 0.4 * spec * lightColor;

        vec3 color = ambient + diffuse + specular;
        gl_FragColor = vec4(color, 1.0);
    }
`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5, 5, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AxesHelper(5));

const geometry = new THREE.BoxGeometry(2, 2, 2);

const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        lightDirection: { value: new THREE.Vector3(1, 2, 1).normalize() },
        lightColor:    { value: new THREE.Color(1, 1, 1) },
        objectColor:   { value: new THREE.Color(0x00aaff) },
        ambientColor:  { value: new THREE.Color(0.2, 0.2, 0.2) },
        cameraPosition: { value: camera.position }
    }
});

const cube = new THREE.Mesh(geometry, shaderMaterial);
scene.add(cube);

cube.position.set(1, 1, 1);

function animate() {
    requestAnimationFrame(animate);
    shaderMaterial.uniforms.cameraPosition.value.copy(camera.position);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let isCube = true;
window.addEventListener("keypress", (event) => {
    if (event.keyCode === 32 || event.which === 32 || event.key === " ") {
        if (isCube) {
            cube.scale.set(1, 2, 0.5);
        } else {
            cube.scale.set(1, 1, 1);
        }

        isCube = !isCube;
    }
});
