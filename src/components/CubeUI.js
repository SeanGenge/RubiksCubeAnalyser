import { useState } from 'react';
import { parseMoveString } from '../lib/move_parser.js';
import { connectGanCube } from 'gan-web-bluetooth';
import * as THREE from 'three';

export default function CubeUI({ updateMoves, cubeQuaternion, basis, HOME_ORIENTATION }) {
  const [moveInput, setMoveInput] = useState('');
  const [conn, setConn] = useState(null);

  const handleExecute = () => {
    const moves = parseMoveString(moveInput);
    updateMoves(moves);
    setMoveInput('');
  };
  
  async function connectAndDiscover() {
    if (conn) {
      await conn.disconnect();
      setConn(null);
    }

    try {
      const tempConn = await connectGanCube(customMacAddressProvider);
      setConn(tempConn);

      tempConn.events$.subscribe(handleCubeEvent);
    }
    catch (ex) {
      console.log(ex);
    }
  }
  
  function resetCubeState() {
    
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
    if (event.type == "GYRO") {
      const { x: qx, y: qy, z: qz, w: qw } = event.quaternion;
      const quat = new THREE.Quaternion(qx, qz, -qy, qw).normalize();

      if (!basis.current) {
        basis.current = quat.clone().conjugate();
      }

      cubeQuaternion.current.copy(
        quat.premultiply(basis.current).premultiply(HOME_ORIENTATION)
      );
    }
    else if (event.type == "MOVE") {
      // This gets added to the queue instead of replacing the value already in the queue
      updateMoves(event.move);
    }
  }

  return (
    <div className="space-y-4 fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col">
      <button
        className="px-2 py-1 bg-blue-600 text-white rounded-lg"
        onClick={conn == null ? connectAndDiscover : resetCubeState}>
        {conn == null ? "Connect Cube" : "Reset State"}
      </button>
      <div className="flex flex-row">
        <input
          value={moveInput}
          onChange={e => setMoveInput(e.target.value)}
          className="px-4 py-2 rounded-l-lg border" />
        <button
          onClick={handleExecute}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg" >
          Execute
        </button>
      </div>
    </div>
  );
}
