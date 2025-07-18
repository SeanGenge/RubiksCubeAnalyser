import * as THREE from 'three';
import { CUBIE_SIZE, FACE_COLORS } from './constants';

export function createCubie(position) {
  // slightly smaller than a full cubie so you see the gaps
  const size = CUBIE_SIZE * 0.95;
  const geometry = new THREE.BoxGeometry(size, size, size);

  const materials = [];
  const faceMapping = [
    { axis: 'x', dir:  1, color: FACE_COLORS.R }, // right
    { axis: 'x', dir: -1, color: FACE_COLORS.L }, // left
    { axis: 'y', dir:  1, color: FACE_COLORS.U }, // up
    { axis: 'y', dir: -1, color: FACE_COLORS.D }, // down
    { axis: 'z', dir:  1, color: FACE_COLORS.F }, // front
    { axis: 'z', dir: -1, color: FACE_COLORS.B }  // back
  ];

  // Outer layer sits exactly at ±CUBIE_SIZE
  faceMapping.forEach(({ axis, dir, color }) => {
    const isExternalFace = position[axis] === dir * CUBIE_SIZE;
    materials.push(
      new THREE.MeshStandardMaterial({
        color:     isExternalFace ? color : 0x101010,
        roughness: 0.5,
        metalness: 0.1,
      })
    );
  });

  const cubie = new THREE.Mesh(geometry, materials);
  cubie.position.copy(position);
  return cubie;
}
