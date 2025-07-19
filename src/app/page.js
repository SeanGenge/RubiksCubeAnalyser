"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { connectGanCube } from 'gan-web-bluetooth';

// dynamically import to avoid SSR issues
const RubiksCube = dynamic(() => import('../components/RubiksCube'), { ssr: false });
const CubeUI    = dynamic(() => import('../components/CubeUI'),    { ssr: false });

export default function Home() {
  const [moves, setMoves] = useState([]);
  let conn = null;

  function updateMoves(newMoves) {
    setMoves(newMoves);
  }
  
  async function connectAndDiscover() {
    if (conn) {
      await conn.disconnect();
      conn = null;
    }
    
    conn = await connectGanCube(customMacAddressProvider);
    
    conn.events$.subscribe(handleCubeEvent);
  }
  
  async function customMacAddressProvider(device, isFallbackCall) {
    if (isFallbackCall) {
      // We failed to auto‑detect earlier, prompt the user to type it in
      return prompt(
        'Unable to determine cube MAC address!\n' +
        'Please enter MAC address manually:'
      );
    } else {
      // If the browser supports watchAdvertisements, return null (so caller will retry auto‑detect).
      // Otherwise, warn the user and fall back to manual entry.
      if (typeof device.watchAdvertisements === 'function') {
        return null;
      } else {
        return 'DC:5C:9B:81:3C:FA';
        // return prompt(
        //   'Seems like your browser does not support Web Bluetooth watchAdvertisements() API.\n' +
        //   'Enable the following flag in Chrome:\n\n' +
        //   '  chrome://flags/#enable-experimental-web-platform-features\n\n' +
        //   'Or enter cube MAC address manually:'
        // );
      }
    }
  }


  function handleCubeEvent(event) {
    if (event.type == "MOVE") {
      console.log("Move: " + event.move);
    }
  }

  return (
    <>
      <div className="relative w-screen h-screen">
        <button onClick={connectAndDiscover}>Connect Cube</button>
        <RubiksCube moves={moves} />
        <CubeUI updateMoves={updateMoves} />
      </div>
    </>
  );
}
