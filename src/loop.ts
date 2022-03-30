import type { Object3D } from 'three'
import { Clump, getInvalidBlocks } from './puzzle'
import { blockCount } from './store'

export function update(wall: Object3D, clump: Clump) {
  wall.position.z += 0.15
  if (wall.position.z >= 3) {
    console.log('wall reset')
    wall.position.z = -50
    const invalidBlocks = getInvalidBlocks(clump)
    invalidBlocks.forEach((b) => b.removeFromParent())
    blockCount.update((count) => clump.blocks.length)
  }
}
