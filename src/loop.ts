import type { Object3D } from 'three'
import { Clump, CLUMP_RADIUS, getInvalidBlocks, removeBlocks } from './puzzle'
import { blockCount } from './store'

export function update(wall: Object3D, clump: Clump) {
  const previousWallZ = wall.position.z
  wall.position.z += 0.15
  for (let checkZ = -CLUMP_RADIUS; checkZ <= CLUMP_RADIUS; checkZ++) {
    if (previousWallZ < checkZ - 1 && wall.position.z >= checkZ - 1) {
      const invalidBlocks = getInvalidBlocks(clump, checkZ)
      if (invalidBlocks.length > 0) {
        removeBlocks(clump, invalidBlocks)
        blockCount.update((count) => clump.blocks.length)
      }
      break
    }
  }
  if (wall.position.z >= CLUMP_RADIUS) {
    wall.position.z = -50
  }
}
