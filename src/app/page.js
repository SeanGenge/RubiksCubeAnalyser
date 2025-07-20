"use client";

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TwistyPlayer } from 'cubing/twisty';
import * as THREE from 'three';

// dynamically import to avoid SSR issues
// const RubiksCube = dynamic(() => import('../components/RubiksCube'), { ssr: false });
const CubeUI    = dynamic(() => import('../components/CubeUI'), { ssr: false });

export default function Home() {
  const [moves, setMoves] = useState([]);
  const cubeContainerRef = useRef(null);
  const rubiksCubeRef = useRef(null);
  const basis = useRef(null);
  const twistyScene = useRef(null);
  const twistyVantage = useRef(null);
  const animationFrameId = useRef(null);
  const HOME_ORIENTATION = new THREE.Quaternion().setFromEuler(new THREE.Euler(15 * Math.PI / 180, -20 * Math.PI / 180, 0));
  const cubeQuaternion = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(30 * Math.PI / 180, -30 * Math.PI / 180, 0)));
  
  useEffect(() => {
    rubiksCubeRef.current = new TwistyPlayer({
      puzzle: '3x3x3',
      visualization: 'PG3D',
      alg: '',
      experimentalSetupAnchor: 'start',
      background: 'none',
      controlPanel: 'none',
      hintFacelets: 'none',
      tempoScale: 5,
    });
    
    cubeContainerRef.current.appendChild(rubiksCubeRef.current);
    
    rubiksCubeRef.current.classList.add("w-[400x]", "h-[400px]");
    
    animationFrameId.current = requestAnimationFrame(animateCubeOrientation);
  }, []);
  
  const animateCubeOrientation = async () => {
    if (!rubiksCubeRef.current) {
      animationFrameId.current = requestAnimationFrame(animateCubeOrientation);
      return;
    }

    try {
      if (!twistyScene.current || !twistyVantage.current) {
        const vantageList = await rubiksCubeRef.current.experimentalCurrentVantages();
        if (!vantageList || vantageList.size === 0) {
          throw new Error("Vantage list not available");
        }

        twistyVantage.current = [...vantageList][0];
        if (!twistyVantage.current?.scene) {
          throw new Error("Vantage scene not available");
        }

        twistyScene.current = await twistyVantage.current.scene.scene();
        if (!twistyScene.current) {
          throw new Error("Scene not available");
        }
      }

      if (twistyScene.current && twistyVantage.current) {
        twistyScene.current.quaternion.slerp(cubeQuaternion.current, 0.25);
        twistyVantage.current.render();
      }
    } catch (error) {
      // console.warn("Animation frame error:", error);
    } finally {
      animationFrameId.current = requestAnimationFrame(animateCubeOrientation);
    }
  };

  function updateMoves(newMoves) {
    setMoves(_ => newMoves);
    // console.log("test: ", newMoves[0].face, newMoves[0].direction);
    // rubiksCubeRef.experimentalAddMove(newMoves, { cancel: false });
    rubiksCubeRef.current.experimentalAddMove(newMoves, { cancel: false });
  }

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center">
      <div ref={cubeContainerRef} className='flex items-center justify-center' />
      <CubeUI updateMoves={updateMoves} cubeQuaternion={cubeQuaternion} basis={basis} HOME_ORIENTATION={HOME_ORIENTATION} />
    </div>
  );
}
