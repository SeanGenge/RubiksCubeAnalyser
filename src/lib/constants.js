// src/lib/constants.js

export const CUBIE_SIZE = 1;
export const ANIMATION_SPEED = 50; // milliseconds per quarter‑turn

export const FACE_COLORS = {
  U: 0xffffff, // White
  D: 0xffff00, // Yellow
  L: 0xff0000, // Red
  R: 0xffa500, // Orange
  F: 0x00ff00, // Green
  B: 0x0000ff  // Blue
};

const PI_HALF = Math.PI / 2;

export const MOVE_DEFINITIONS = {
  // Single‑layer turns
  U: { face: 'U', axis: 'y', angle: -PI_HALF, slice:  1 },
  D: { face: 'D', axis: 'y', angle:  PI_HALF, slice: -1 },
  L: { face: 'L', axis: 'x', angle:  PI_HALF, slice: -1 },
  R: { face: 'R', axis: 'x', angle: -PI_HALF, slice:  1 },
  F: { face: 'F', axis: 'z', angle: -PI_HALF, slice:  1 },
  B: { face: 'B', axis: 'z', angle:  PI_HALF, slice: -1 },

  // Middle‑slice moves
  M: { face: 'M', axis: 'x', angle:  PI_HALF, slice:  0 },
  E: { face: 'E', axis: 'y', angle:  PI_HALF, slice:  0 },
  S: { face: 'S', axis: 'z', angle: -PI_HALF, slice:  0 },

  // Wide turns (lowercase = turn both layer and slice)
  u: { face: 'u', axis: 'y', angle: -PI_HALF, slice:  1 },
  d: { face: 'd', axis: 'y', angle:  PI_HALF, slice: -1 },
  l: { face: 'l', axis: 'x', angle:  PI_HALF, slice: -1 },
  r: { face: 'r', axis: 'x', angle: -PI_HALF, slice:  1 },
  f: { face: 'f', axis: 'z', angle: -PI_HALF, slice:  1 },
  b: { face: 'b', axis: 'z', angle:  PI_HALF, slice: -1 },

  // Whole‑cube rotations
  x: { face: 'x', axis: 'x', angle: -PI_HALF, slice:  1 },
  y: { face: 'y', axis: 'y', angle: -PI_HALF, slice:  1 },
  z: { face: 'z', axis: 'z', angle: -PI_HALF, slice:  1 },
};
