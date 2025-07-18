import { useState } from 'react';
import { parseMoveString } from '../lib/move_parser.js';

export default function CubeUI({ updateMoves }) {
  const [moveInput, setMoveInput] = useState('');

  const handleExecute = () => {
    const moves = parseMoveString(moveInput);
    updateMoves(moves);
    setMoveInput('');
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex">
      <input
        value={moveInput}
        onChange={e => setMoveInput(e.target.value)}
        className="px-4 py-2 rounded-l-lg border"
      />
      <button
        onClick={handleExecute}
        className="px-4 py-2 bg-blue-600 text-white rounded-r-lg"
      >
        Execute
      </button>
    </div>
  );
}