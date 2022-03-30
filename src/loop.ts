import {
  CLUMP_RADIUS,
  createWall,
  getInvalidBlocks,
  Puzzle,
  randomizeRotation,
  removeBlocks,
} from './puzzle'
import { blockCount } from './store'

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
  if (wall.mesh.position.z >= CLUMP_RADIUS) {
    const oldWall = wall
    oldWall.mesh.removeFromParent()
    oldWall.mesh.geometry.dispose()
    const newRotation = clump.blocks.map((b) => b.clone())
    randomizeRotation(newRotation)
    puzzle.wall = createWall(newRotation)
    puzzle.wall.mesh.position.z = -50
    puzzle.scene.add(puzzle.wall.mesh)
  }
}
