"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { CUBIE_SIZE, MOVE_DEFINITIONS, ANIMATION_SPEED } from '../lib/constants';
import { createCubie } from '../lib/cubie';

export default function RubiksCubeScene({ moves }) {
  const mountRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [cubeGroup, setCubeGroup] = useState(new THREE.Group());
  const [cubies, setCubies] = useState([]);
  const [pivot, setPivot] = useState(new THREE.Group());
  const [animationQueue, setAnimationQueue] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(4, 5, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 5;
    controls.maxDistance = 20;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 10, 7.5);
    scene.add(dl);

    // Resize Handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      TWEEN.update();
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
    
    // Update the scene at the end
    setScene(scene);
    
    createCube();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!scene) return;
    
    scene.add(cubeGroup);
    scene.add(pivot);
  }, [cubeGroup, pivot, scene]);
  
  function createCube() {
    const newCubies = [];
    const newCubeGroup = new THREE.Group();
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) { 
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          
          const position = new THREE.Vector3(x, y, z)
            .multiplyScalar(CUBIE_SIZE);
          const cubie = createCubie(position);
          
          newCubies.push(cubie);
          newCubeGroup.add(cubie);
        }
      }
    }
    
    setCubies(newCubies);
    setCubeGroup(newCubeGroup);
  }
  
  function addMovesToQueue(moves) {
    setAnimationQueue(prevQueue => {
      const nextQueue = [...prevQueue, ...moves];
      
      return nextQueue;
    });
  }
  
  useEffect(() => {
    if (!isAnimating && animationQueue.length > 0) {
      processQueue();
    }
  }, [isAnimating, animationQueue, processQueue]);

  const processQueue = useCallback(() => {
    
    if (animationQueue.length === 0) {
      setIsAnimating(false);
      
      return;
    }
    
    setIsAnimating(true);
    
    let nextMove;
    setAnimationQueue(prev => {
      const [move, ...rest] = prev;
      nextMove = move;
      
      return rest;
    });
    
    animateMove(nextMove);
  }, [animateMove, animationQueue.length]);

  const animateMove = useCallback((move) => {
    const { face, axis, angle, slice } = MOVE_DEFINITIONS[move.face];
    const turnAngle = angle * move.direction * (move.double ? 2 : 1);

    const cubiesToRotate = getCubiesForMove(axis, slice);
    cubiesToRotate.forEach(cubie => pivot.attach(cubie));

    new TWEEN.Tween(pivot.rotation)
      .to({ [axis]: turnAngle }, ANIMATION_SPEED)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        pivot.updateMatrixWorld();
        cubiesToRotate.forEach(cubie => cubeGroup.attach(cubie));
        pivot.rotation[axis] = 0;
        setIsAnimating(false);
        processQueue();
      })
      .start();
  }, [cubeGroup, pivot, processQueue]);
  
  function getCubiesForMove(axis, slice) {
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

  useEffect(() => {
    if (!scene) return;
    
    addMovesToQueue(moves);
  }, [moves, scene]);

  return <div ref={mountRef} className="w-full h-full" />;
}