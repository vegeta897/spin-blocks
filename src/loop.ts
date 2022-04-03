import {
  CLUMP_RADIUS,
  createWall,
  getInvalidBlocksAtZ,
  getNextBlockPosition,
  Puzzle,
  randomizeRotation,
  removeBlocksFromClump,
  updateClumpBlockMeshes,
  updateClumpShadows,
} from './puzzle'
import { blockCount } from './store'
import type { MeshLambertMaterial } from 'three'
import { lockControls, unlockControls } from './control'
import { zoomCameraTo, zoomCameraToDefault, zoomInCamera } from './camera'
import { explodeBlock, updateParticles } from './particles'

let turboMode = false

export function turbo() {
  turboMode = true
}

const DEFAULT_WALL_SPEED = 0.15
const MAX_WALL_SPEED = 5
let wallSpeed = DEFAULT_WALL_SPEED

export function update(puzzle: Puzzle) {
  updateParticles(puzzle.particles)
  const { wall, clump } = puzzle
  if (turboMode) {
    wallSpeed = Math.min(MAX_WALL_SPEED, wallSpeed + (wallSpeed < DEFAULT_WALL_SPEED ? 0.02 : 0.1))
    zoomInCamera(((wallSpeed + (1 - DEFAULT_WALL_SPEED)) / 3) ** 4)
  } else {
    wallSpeed = Math.min(DEFAULT_WALL_SPEED, wallSpeed + 0.005)
    zoomCameraToDefault()
  }
  const nextWallZ = wall.mesh.position.z + wallSpeed
  while (wall.mesh.position.z < nextWallZ) {
    const previousWallZ = wall.mesh.position.z
    wall.mesh.position.z = Math.min(nextWallZ, wall.mesh.position.z + 1)
    for (let checkZ = -CLUMP_RADIUS; checkZ <= CLUMP_RADIUS; checkZ++) {
      if (previousWallZ < checkZ - 1 && wall.mesh.position.z >= checkZ - 1) {
        const invalidBlocks = getInvalidBlocksAtZ(
          [...clump.blocks.keys()],
          wall.holeVectors,
          checkZ
        )
        if (invalidBlocks.length > 0) {
          zoomInCamera(2)
          wallSpeed = 0
          const removedBlocks = removeBlocksFromClump(clump, invalidBlocks)
          removedBlocks.forEach((b) => explodeBlock(b, puzzle, turboMode))
          updateClumpBlockMeshes(clump)
          updateClumpShadows(puzzle)
          blockCount.update(() => clump.blocks.size)
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
    clump.blocks.set(getNextBlockPosition([...clump.blocks.keys()]), null)
    blockCount.update(() => clump.blocks.size)
    const newRotation = [...clump.blocks.keys()].map((v) => v.clone())
    randomizeRotation(newRotation)
    updateClumpBlockMeshes(clump)
    updateClumpShadows(puzzle)
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
