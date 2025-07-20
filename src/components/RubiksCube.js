"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { CUBIE_SIZE, MOVE_DEFINITIONS, ANIMATION_SPEED } from '../lib/constants';
import { createCubie } from '../lib/cubie';

export default function RubiksCubeScene({ moves }) {
	const mountRef = useRef(null);
	const [scene, setScene] = useState(null);
	const [cubeGroup, setCubeGroup] = useState(null);
	const [cubies, setCubies] = useState([]);
	const [pivot, setPivot] = useState(null);
	const [animationQueue, setAnimationQueue] = useState([]);
	const [isAnimating, setIsAnimating] = useState(false);
	
	const tweenGroup = useMemo(() => new TWEEN.Group(), []);
	
	useEffect(() => {
		const mountNode = mountRef.current;
		if (!mountNode) return;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x111111);
		
		const width = mountNode.clientWidth;
		const height = mountNode.clientHeight;

		const camera = new THREE.PerspectiveCamera(
			50,
			width / height,
			0.1,
			2000
		);
		camera.position.set(4, 5, 8);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		
		const resize = () => {
			const width = mountNode.clientWidth;
			const height = mountNode.clientHeight;
			
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		};
		
		resize();
		window.addEventListener('resize', resize);
		
		// Remove all child nodes before adding a new one. Prevents duplicates
		if (mountNode.hasChildNodes()) {
			mountNode.innerHTML = '';
		}
		
		mountNode.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.minDistance = 5;
		controls.maxDistance = 20;

		scene.add(new THREE.AmbientLight(0xffffff, 0.6));
		const dl = new THREE.DirectionalLight(0xffffff, 0.8);
		dl.position.set(5, 10, 7.5);
		scene.add(dl);
		
		const cubeGroup = new THREE.Group();
		const pivot = new THREE.Group();
		
		scene.add(cubeGroup);
		scene.add(pivot);
		
		setCubeGroup(cubeGroup);
		setPivot(pivot);
		setScene(scene);
		
		createCube();
		
		animate();
		
		// Animation Loop
		function animate() {
			requestAnimationFrame(animate);
			tweenGroup.update();
			controls.update();
			renderer.render(scene, camera);
		}
	}, []);
	
	useEffect(() => {
		if (!scene) return;

		if (cubeGroup) scene.add(cubeGroup);
		if (pivot) scene.add(pivot);
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
	
	const getCubiesForMove = useCallback((axis, slice) => {
		const threshold = CUBIE_SIZE / 2;
		return cubies.filter(cubie => {
			const pos = cubie.position[axis];
			if (slice === 0) {
				return Math.abs(pos) < threshold;
			} else {
				return Math.abs(pos - slice * CUBIE_SIZE) < threshold;
			}
		});
	}, [cubies]);
	
	const animateMove = useCallback((move) => {
		const { face, axis, angle, slice } = MOVE_DEFINITIONS[move.face];
		const turnAngle = angle * move.direction * (move.double ? 2 : 1);

		const cubiesToRotate = getCubiesForMove(axis, slice);
		cubiesToRotate.forEach(c => pivot.attach(c));

		new TWEEN.Tween(pivot.rotation, tweenGroup)
			.to({ [axis]: turnAngle }, ANIMATION_SPEED)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onComplete(() => {
				pivot.updateMatrixWorld();
				cubiesToRotate.forEach(c => cubeGroup.attach(c));
				pivot.rotation[axis] = 0;
				setIsAnimating(_ => false);
			})
			.start();
	}, [cubeGroup, getCubiesForMove, pivot, tweenGroup]);
	
	const processQueue = useCallback(() => {
		if (animationQueue.length === 0) {
			setIsAnimating(false);
			
			return;
		}
		
		setAnimationQueue(prev => {
			const [move, ...rest] = prev;
			
			console.log("Anim: ", move.face, move.direction); 
			
			setIsAnimating(_ => true);
			animateMove(move);
			
			return rest;
		});
	}, [animateMove, animationQueue]);
	
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
	
	useEffect(() => {
		if (!scene || moves.length === 0) return;
		
		addMovesToQueue(moves);
	}, [moves, scene]);

	return <div className="w-full h-[100vh]" ref={mountRef} />;
}