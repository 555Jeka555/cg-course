import * as THREE from "three";
import {Game} from "./Game.ts";

function main(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);


    const game = new Game(scene, camera);

    let lastTime = 0;
    function animate(time) {
        const deltaTime = (time - lastTime) / 1000; // в секундах
        lastTime = time;

        game.update(deltaTime);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate(0);
}

main();