import type { Object3D } from 'three'
import { getInvalidBlocks } from './puzzle'
import { blockCount } from './store'

export function update(wall: Object3D, clump: Object3D, flatBlocks: Object3D[]) {
  wall.position.z += 0.15
  if (wall.position.z >= 3) {
    console.log('wall reset')
    wall.position.z = -50
    const invalidBlocks = getInvalidBlocks(clump.children, flatBlocks)
    invalidBlocks.forEach((b) => b.removeFromParent())
    blockCount.update((count) => clump.children.length)
  }
}
