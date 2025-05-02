import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {Camera, ShaderMaterial} from "three";
import {CustomMaterial} from "./CustomMaterial.ts";

export class App {
    private scene;
    private camera;
    private renderer;
    private controls;
    private light;

    private sphere;
    private cube;
    private plane;

    private sphereMaterial;
    private cubeMaterial;

    public run() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initControls();
        this.initLight();
        this.initObjects();
        this.applyShadowShader();

        this.animate();
    }

    private initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
    }

    private initCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }

    private initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.body.appendChild(this.renderer.domElement);
    }

    private initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
    }

    private initLight() {
        this.light = new THREE.PointLight(0xffffff, 100, 100);
        this.light.position.set(5, 8, 5);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.light.shadow.bias = -0.001;

        this.scene.add(this.light)
    }

    private initObjects() {
        this.sphere = new THREE.Mesh(
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
        this.sphere.position.set(-2, 1, 0);
        this.sphere.castShadow = true;
        this.sphere.receiveShadow = true;
        this.scene.add(this.sphere);

        this.cube = new THREE.Mesh(
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
        this.cube.position.set(2, 1, 0);
        this.cube.castShadow = true;
        this.cube.receiveShadow = true;
        this.scene.add(this.cube);

        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                side: THREE.DoubleSide,
                roughness: 0.8,
                metalness: 0.2,
                shadowSide: THREE.DoubleSide
            })
        );
        this.plane.rotation.x = -Math.PI / 2;
        this.plane.position.y = -1;
        this.plane.receiveShadow = true;
        this.scene.add(this.plane);
    }

    private applyShadowShader() {
        const shadowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                lightPos: { value: this.light.position },
                lightColor: { value: this.light.color },
                lightIntensity: { value: this.light.intensity },
                shadowMap: { value: this.light.shadow.map },
                shadowMatrix: { value: this.light.shadow.matrix },
                shadowRadius: { value: 0.5 },
                samples: { value: 16 },

                materialDiffuse: { value: new THREE.Color(0.5, 0.25, 0.15) },
                materialAmbient: { value: new THREE.Color(0.1, 0.1, 0.1) },
                materialSpecular: { value: new THREE.Color(0.2, 0.2, 0.2) },
                materialShininess: { value: 100 },
                viewPos: { value: this.camera.position }
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
        uniform vec3 lightPos;
        uniform vec3 lightColor;
        uniform float lightIntensity;
        uniform sampler2D shadowMap;
        uniform mat4 shadowMatrix;
        uniform float shadowRadius;
        uniform int samples;
        
        uniform vec3 materialDiffuse;
        uniform vec3 materialAmbient;
        uniform vec3 materialSpecular;
        uniform float materialShininess;
        uniform vec3 viewPos;
        
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec4 vShadowCoord;
       
        
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
            // Ambient
            vec3 ambient = lightColor * materialAmbient;
            
            // Diffuse 
            vec3 norm = normalize(vNormal);
            vec3 lightDir = normalize(lightPos - vWorldPosition);
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuse = lightColor * (diff * materialDiffuse);
            
            // Specular
            vec3 viewDir = normalize(viewPos - vWorldPosition);
            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), materialShininess);
            vec3 specular = lightColor * (spec * materialSpecular);
            
            // Shadow
            float shadow = calculateShadow();
            
            // Combine with shadow affecting only diffuse and specular
            vec3 result = ambient + shadow * (diffuse * 0.7 + specular * 0.3);
            gl_FragColor = vec4(result, 1.0);
        }
    `
        });

        this.sphereMaterial = shadowMaterial.clone();
        this.sphereMaterial.uniforms.materialDiffuse.value = new THREE.Color(0xff0000);
        this.sphereMaterial.uniforms.materialAmbient.value = new THREE.Color(0x00ff00);
        this.sphereMaterial.uniforms.materialSpecular.value = new THREE.Color(0xffffff);
        this.sphereMaterial.uniforms.materialShininess.value = 200;

        this.sphere.material = this.sphereMaterial as unknown as CustomMaterial;

        this.cubeMaterial = shadowMaterial.clone();
        this.cubeMaterial.uniforms.materialDiffuse.value = new THREE.Color(0x00ff00);
        this.cubeMaterial.uniforms.materialAmbient.value = new THREE.Color(0x0000ff);
        this.cubeMaterial.uniforms.materialSpecular.value = new THREE.Color(0xffffff);
        this.cubeMaterial.uniforms.materialShininess.value = 50;

        this.cube.material = this.cubeMaterial as unknown as CustomMaterial;
    }

    private animate() {
        requestAnimationFrame(() => {this.animate()});

        this.sphereMaterial.uniforms.viewPos.value = this.camera.position;
        this.cubeMaterial.uniforms.viewPos.value = this.camera.position;

        this.sphereMaterial.uniforms.shadowMatrix.value = this.light.shadow.matrix;
        this.cubeMaterial.uniforms.shadowMatrix.value = this.light.shadow.matrix;

        this.sphereMaterial.uniforms.shadowMap.value = this.light.shadow.map;
        this.cubeMaterial.uniforms.shadowMap.value = this.light.shadow.map;

        this.sphere.rotation.y += 0.01;
        this.cube.rotation.x += 0.01;

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}