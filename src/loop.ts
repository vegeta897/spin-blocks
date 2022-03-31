import {
  addBlockToClump,
  CLUMP_RADIUS,
  createWall,
  getInvalidBlocksAtZ,
  getNextBlockPosition,
  Puzzle,
  randomizeRotation,
  removeBlocks,
} from './puzzle'
import { blockCount } from './store'
import type { MeshLambertMaterial } from 'three'
import { lockControls, unlockControls } from './control'

let turboMode = false

export function turbo() {
  turboMode = true
}

const DEFAULT_WALL_SPEED = 0.15
const MAX_WALL_SPEED = 5
let wallSpeed = DEFAULT_WALL_SPEED

export function update(puzzle: Puzzle) {
  const { wall, clump } = puzzle
  if (turboMode) wallSpeed = Math.min(MAX_WALL_SPEED, (wallSpeed += 0.1))
  const nextWallZ = wall.mesh.position.z + wallSpeed
  while (wall.mesh.position.z < nextWallZ) {
    const previousWallZ = wall.mesh.position.z
    wall.mesh.position.z = Math.min(nextWallZ, wall.mesh.position.z + 1)
    for (let checkZ = -CLUMP_RADIUS; checkZ <= CLUMP_RADIUS; checkZ++) {
      if (previousWallZ < checkZ - 1 && wall.mesh.position.z >= checkZ - 1) {
        const invalidBlocks = getInvalidBlocksAtZ(clump.blocks, wall.holeBlocks, checkZ)
        if (invalidBlocks.length > 0) {
          removeBlocks(clump, invalidBlocks)
          blockCount.update(() => clump.blocks.length)
        }
        break
      }
    }
  }
  if (wall.mesh.position.z > -CLUMP_RADIUS - wallSpeed) {
    lockControls()
  }
  if (wall.mesh.position.z > -(wallSpeed ** 2)) {
    const fadeProgress = Math.min(
      1,
      (wall.mesh.position.z + wallSpeed ** 2) / (CLUMP_RADIUS + 2 + wallSpeed ** 2)
    )
    ;(<MeshLambertMaterial>wall.mesh.material).opacity = 1 - fadeProgress
  }
  if (wall.mesh.position.z > CLUMP_RADIUS + 2) {
    addBlockToClump(clump, getNextBlockPosition(clump.blocks))
    blockCount.update(() => clump.blocks.length)
    const newRotation = clump.blocks.map((b) => b.clone())
    randomizeRotation(newRotation)
    const oldWall = wall
    oldWall.mesh.removeFromParent()
    oldWall.mesh.geometry.dispose()
    puzzle.wall = createWall(newRotation)
    puzzle.wall.mesh.position.z = -50
    puzzle.scene.add(puzzle.wall.mesh)
    unlockControls()
    turboMode = false
    wallSpeed = DEFAULT_WALL_SPEED
  }
}
