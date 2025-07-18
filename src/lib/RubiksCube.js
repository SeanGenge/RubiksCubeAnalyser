import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { CUBIE_SIZE, MOVE_DEFINITIONS, ANIMATION_SPEED } from './constants';
import { createCubie } from './cubie';

export class RubiksCube {
  constructor(scene) {
    this.scene = scene;
    this.cubeGroup = new THREE.Group();
    this.cubies = [];
    this.pivot = new THREE.Group();
    this.animationQueue = [];
    this.isAnimating = false;

    this.scene.add(this.cubeGroup);
    this.scene.add(this.pivot);

    this.createCube();
  }

  createCube() {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) { 
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const position = new THREE.Vector3(x, y, z)
            .multiplyScalar(CUBIE_SIZE);
          const cubie = createCubie(position);
          this.cubies.push(cubie);
          this.cubeGroup.add(cubie);
        }
      }
    }
  }

  addMovesToQueue(moves) {
    this.animationQueue.push(...moves);
    if (!this.isAnimating) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.animationQueue.length === 0) {
      this.isAnimating = false;
      return;
    }
    this.isAnimating = true;
    const move = this.animationQueue.shift();
    this.animateMove(move);
  }

  animateMove(move) {
    const { face, axis, angle, slice } = MOVE_DEFINITIONS[move.face];
    const turnAngle = angle * move.direction * (move.double ? 2 : 1);

    const cubiesToRotate = this.getCubiesForMove(axis, slice);
    cubiesToRotate.forEach(cubie => this.pivot.attach(cubie));

    new TWEEN.Tween(this.pivot.rotation)
      .to({ [axis]: turnAngle }, ANIMATION_SPEED)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        this.pivot.updateMatrixWorld();
        cubiesToRotate.forEach(cubie => this.cubeGroup.attach(cubie));
        this.pivot.rotation[axis] = 0;
        this.isAnimating = false;
        this.processQueue();
      })
      .start();
  }

  getCubiesForMove(axis, slice) {
    const threshold = CUBIE_SIZE / 2;
    return this.cubies.filter(cubie => {
      const pos = cubie.position[axis];
      if (slice === 0) {
        return Math.abs(pos) < threshold;
      } else {
        return Math.abs(pos - slice * CUBIE_SIZE) < threshold;
      }
    });
  }
}
