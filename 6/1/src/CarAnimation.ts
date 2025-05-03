import * as THREE from "three";

export class CarAnimation {
    public carAnimationState = {
        currentCorner: 0,
        progress: 0,
        speed: 0.007
    };
    public squarePath: THREE.Vector3[] = [
        new THREE.Vector3(10, -11.6, -15),
        new THREE.Vector3(40, -11.6, -15),
        new THREE.Vector3(40, -11.6, 15),
        new THREE.Vector3(10, -11.6, 15),
        new THREE.Vector3(10, -11.6, -13),
    ]
}