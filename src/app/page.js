"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

// dynamically import to avoid SSR issues
const RubiksCubeScene = dynamic(() => import('../components/RubiksCubeScene'), { ssr: false });
const CubeUI    = dynamic(() => import('../components/CubeUI'),    { ssr: false });

export default function Home() {
  const [moves, setMoves] = useState([]);

  function updateMoves(newMoves) {
    setMoves(newMoves);
  }

  return (
    <>
      <div className="relative w-screen h-screen">
        <RubiksCubeScene moves={moves} />
        <CubeUI updateMoves={updateMoves} />
      </div>
    </>
  );
}
