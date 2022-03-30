import {
  addBlockToClump,
  CLUMP_RADIUS,
  createWall,
  getInvalidBlocks,
  getNextBlockPosition,
  Puzzle,
  randomizeRotation,
  removeBlocks,
} from './puzzle'
import { blockCount } from './store'
import type { MeshLambertMaterial } from 'three'
import { lockControls, unlockControls } from './control'

export function update(puzzle: Puzzle) {
  const { wall, clump } = puzzle
  const previousWallZ = wall.mesh.position.z
  wall.mesh.position.z += 0.15
  for (let checkZ = -CLUMP_RADIUS; checkZ <= CLUMP_RADIUS; checkZ++) {
    if (previousWallZ < checkZ - 1 && wall.mesh.position.z >= checkZ - 1) {
      const invalidBlocks = getInvalidBlocks(clump, wall, checkZ)
      if (invalidBlocks.length > 0) {
        removeBlocks(clump, invalidBlocks)
        blockCount.update((count) => clump.blocks.length)
      }
      break
    }
  }
  if (wall.mesh.position.z > -CLUMP_RADIUS - 1.2) {
    lockControls()
  }
  if (wall.mesh.position.z > 0) {
    const fadeProgress = Math.min(1, wall.mesh.position.z / (CLUMP_RADIUS + 2))
    ;(<MeshLambertMaterial>wall.mesh.material).opacity = 1 - fadeProgress
  }
  if (wall.mesh.position.z > CLUMP_RADIUS + 2) {
    addBlockToClump(clump, getNextBlockPosition(clump))
    blockCount.update((count) => clump.blocks.length)
    const newRotation = clump.blocks.map((b) => b.clone())
    randomizeRotation(newRotation)
    const oldWall = wall
    oldWall.mesh.removeFromParent()
    oldWall.mesh.geometry.dispose()
    puzzle.wall = createWall(newRotation)
    puzzle.wall.mesh.position.z = -50
    puzzle.scene.add(puzzle.wall.mesh)
    unlockControls()
  }
}
