import { MOVE_DEFINITIONS } from './constants';

export function parseMoveString(input) {
  const moves = [];
  // split on any whitespace, upper‑case for consistency
  const tokens = input.trim().toUpperCase().split(/\s+/);
  const validFaces = Object.keys(MOVE_DEFINITIONS);
  console.log(tokens);
  for (const token of tokens) {
    if (!token) continue;

    const face = token.charAt(0);
    const modifier = token.slice(1);

    // ignore invalid faces
    if (!validFaces.includes(face)) continue;

    let direction = 1;  // clockwise
    let double    = false;

    if (modifier.includes("'")) direction = -1;   // counter‑clockwise
    if (modifier.includes("2")) double    = true;  // half‑turn

    moves.push({ face, direction, double });
  }

  return moves;
}
