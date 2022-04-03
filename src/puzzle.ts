import {
  Box3,
  BoxGeometry,
  GridHelper,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Scene,
  Vector3,
} from 'three'
import { CSG } from 'three-csg-ts'
import {
  CardinalAxes,
  get6Neighbors,
  getBlockMaterial,
  pickRandom,
  randomInt,
  xyEqualInAll,
  xyIsEqual,
} from './util'
import { get } from 'svelte/store'
import { blockCount } from './store'
import type { Particle } from './particles'

export const CLUMP_DIAMETER = 7
export const WALL_SIZE = CLUMP_DIAMETER + 2
export const CLUMP_RADIUS = Math.floor(CLUMP_DIAMETER / 2)

// TODO: Decide whether to stick with these pure-ish functions, or create classes
// Try to abstract a lot of the crap in loop.ts to functions in here?

export interface Puzzle {
  clump: Clump
  wall: Wall
  scene: Scene
  particles: Set<Particle>
}

export interface Clump {
  blockContainer: Group
  blocks: Map<Vector3, Mesh | null>
  shadow: Group | null
}

export interface Wall {
  mesh: Mesh
  holeVectors: Vector3[]
}

export function createPuzzle(scene: Scene): Puzzle {
  const clump = createClump()
  const blockVectors = [...clump.blocks.keys()]
  const wall = createWall(blockVectors)
  wall.mesh.position.z = -50
  randomizeRotation(blockVectors)
  updateClumpBlockMeshes(clump)
  const puzzle = {
    clump,
    wall,
    scene,
    particles: <Set<Particle>>new Set(),
  }
  updateClumpShadows(puzzle)
  scene.add(clump.blockContainer, wall.mesh)
  return puzzle
}

export function createClump(): Clump {
  const clump: Clump = {
    blockContainer: new Group(),
    blocks: new Map([[new Vector3(), null]]),
    shadow: null,
  }
  while (clump.blocks.size < get(blockCount)) {
    clump.blocks.set(getNextBlockPosition([...clump.blocks.keys()]), null)
  }
  // updateClumpBlockMeshes(clump)
  // TODO: Center result on 0,0
  return clump
}

const clumpBoundingBox = new Box3(
  new Vector3(-CLUMP_RADIUS, -CLUMP_RADIUS, -CLUMP_RADIUS),
  new Vector3(CLUMP_RADIUS, CLUMP_RADIUS, CLUMP_RADIUS)
)

export function getNextBlockPosition(blockVectors: Vector3[]): Vector3 {
  const shadowIsOneBlock = xyEqualInAll(blockVectors)
  const neighbors: Vector3[] = []
  for (const blockVector of blockVectors) {
    for (const neighbor of get6Neighbors(blockVector)) {
      if (!clumpBoundingBox.containsPoint(neighbor)) continue
      if (blockVectors.some((v) => v.equals(neighbor))) continue
      if (shadowIsOneBlock && xyIsEqual(blockVector, neighbor)) continue
      neighbors.push(neighbor)
    }
  }
  if (neighbors.length === 0) throw 'No eligible neighbors found'
  return pickRandom(neighbors)
}

const blockGeometry = new BoxGeometry()
export function updateClumpBlockMeshes(clump: Clump) {
  for (let [vector, mesh] of clump.blocks) {
    const newBlock = !mesh
    mesh = mesh || new Mesh(blockGeometry, getBlockMaterial())
    mesh.position.copy(vector)
    mesh.updateMatrix()
    if (newBlock) {
      clump.blockContainer.add(mesh)
      clump.blocks.set(vector, mesh)
    }
  }
}

// Pitch up, yaw left, roll left
const randomAxes = [CardinalAxes[0], CardinalAxes[2], CardinalAxes[4]] as const
export function randomizeRotation(blockVectors: Vector3[]) {
  if (blockVectors.length === 1) return
  const shadowIsOneBlock = xyEqualInAll(blockVectors)
  let attempts = 0
  const clump = blockVectors.map((b) => b.clone())
  do {
    // Rotate until clump does not fit in shadow
    randomAxes.forEach((axis) => {
      const rotations = randomInt(0, 3)
      for (let i = 0; i < rotations; i++) {
        rotateBlocks(blockVectors, axis)
      }
    })
    // No rotation will cause a one-block-shadow clump to be invalid
    if (shadowIsOneBlock) break
    attempts++
  } while (getInvalidBlocks(clump, blockVectors).length === 0 && attempts < 100)
}

const wallMaterial = new MeshPhongMaterial({ color: '#d22573', transparent: true })
const holeBlock = new Mesh(blockGeometry)
export function createWall(blockVectors: Vector3[]): Wall {
  wallMaterial.opacity = 1
  const wallGeometry = new BoxGeometry(WALL_SIZE, WALL_SIZE, 1)
  let wallCSG = CSG.fromGeometry(wallGeometry)
  const holeVectors: Vector3[] = []
  for (const blockVector of blockVectors) {
    if (holeVectors.some((hv) => xyIsEqual(hv, blockVector))) {
      continue
    }
    holeBlock.position.copy(blockVector)
    holeBlock.position.z = 0
    holeVectors.push(holeBlock.position.clone())
    holeBlock.updateMatrix()
    wallCSG = wallCSG.subtract(CSG.fromMesh(holeBlock))
  }
  const wallGrid = new GridHelper(WALL_SIZE, WALL_SIZE, 0, '#5b1b38')
  wallGrid.position.z = -0.5
  wallGrid.rotateX(Math.PI / 2)
  const mesh = CSG.toMesh(wallCSG, new Matrix4(), wallMaterial)
  mesh.add(wallGrid)
  return {
    mesh,
    holeVectors,
  }
}

export function rotateBlocks(blockVectors: Vector3[], axis: Vector3) {
  blockVectors.forEach((blockVector) => {
    blockVector.applyAxisAngle(axis, Math.PI / 2)
    blockVector.round()
  })
}

function getInvalidBlocks(blockVectors: Vector3[], holeVectors: Vector3[]): Vector3[] {
  return blockVectors.filter((blockV) => !holeVectors.some((holeV) => xyIsEqual(holeV, blockV)))
}

export function getInvalidBlocksAtZ(
  blockVectors: Vector3[],
  holeVectors: Vector3[],
  z: number
): Vector3[] {
  return getInvalidBlocks(blockVectors, holeVectors).filter((bv) => bv.z === z)
}

export function removeBlocksFromClump(clump: Clump, removeVectors: Vector3[]): Mesh[] {
  const removedMeshes: Mesh[] = []
  clump.blocks.forEach((mesh, vector) => {
    if (removeVectors.some((rv) => vector.equals(rv))) {
      clump.blocks.delete(vector)
      if (mesh) {
        removedMeshes.push(mesh)
        mesh.removeFromParent()
        mesh.geometry.dispose()
      }
    }
  })
  return removedMeshes
}

const shadowMaterial = new MeshBasicMaterial({ color: '#571533' })
function createShadowMesh(blocks: Mesh[], axis: 'x' | 'y' | 'z'): Mesh {
  let shadow: Mesh | undefined
  for (const block of blocks) {
    if (!shadow) {
      shadow = block.clone()
      continue
    }
    const flatBlock = block.clone()
    flatBlock.position[axis] = 0
    flatBlock.updateMatrix()
    // TODO: Use BufferGeometryUtils.mergeBufferGeometries instead
    shadow = CSG.union(shadow, flatBlock)
  }
  shadow!.material = shadowMaterial
  shadow!.scale[axis] = 0.001
  return shadow!
}

function getClumpShadows(clump: Clump): Group {
  const blocks = <Mesh[]>clump.blockContainer.children
  const shadowContainer = new Group()
  const bottomShadow = createShadowMesh(blocks, 'y')
  bottomShadow.position.y = CLUMP_DIAMETER / 2 + 1 + 0.01
  const topShadow = bottomShadow.clone()
  topShadow.position.y = -bottomShadow.position.y
  const rightShadow = createShadowMesh(blocks, 'x')
  rightShadow.position.x = CLUMP_DIAMETER / 2 + 1 + 0.01
  const leftShadow = rightShadow.clone()
  leftShadow.position.x = -rightShadow.position.x
  shadowContainer.add(bottomShadow, topShadow, rightShadow, leftShadow)
  return shadowContainer
}

export function updateClumpShadows(puzzle: Puzzle) {
  if (puzzle.clump.shadow) {
    puzzle.clump.shadow.removeFromParent()
    puzzle.clump.shadow.children.forEach((s) => (<Mesh>s).geometry.dispose())
  }
  puzzle.clump.shadow = getClumpShadows(puzzle.clump)
  puzzle.scene.add(puzzle.clump.shadow)
}
