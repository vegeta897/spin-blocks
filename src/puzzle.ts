import {
  Box3,
  BoxGeometry,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
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
  xyEqualInGroup,
  xyIsEqual,
} from './util'
import { get } from 'svelte/store'
import { blockCount } from './store'

export const CLUMP_DIAMETER = 7
export const WALL_SIZE = CLUMP_DIAMETER + 2
export const CLUMP_RADIUS = Math.floor(CLUMP_DIAMETER / 2)

export interface Puzzle {
  clump: Clump
  wall: Wall
  scene: Scene
}

export interface Clump {
  container: Object3D
  blocks: Mesh[]
  shadow: Object3D | null
}

// TODO: Change all block data/functions to work with Vector3s instead of Mesh/Object3D, update actual block meshes when needed

export function createPuzzle(scene: Scene): Puzzle {
  const clump = createClump()
  const wall = createWall(clump.blocks)
  wall.mesh.position.z = -50
  randomizeRotation(clump.blocks)
  const puzzle = {
    clump,
    wall,
    scene,
  }
  updateClumpShadows(puzzle)
  return puzzle
}

export function createClump(): Clump {
  const clump = {
    container: new Object3D(),
    blocks: [],
    shadow: null,
  }
  addBlockToClump(clump, new Vector3())
  while (clump.blocks.length < get(blockCount)) {
    addBlockToClump(clump, getNextBlockPosition(clump.blocks))
  }
  // TODO: Center result on 0,0
  return clump
}

const clumpBoundingBox = new Box3(
  new Vector3(-CLUMP_RADIUS, -CLUMP_RADIUS, -CLUMP_RADIUS),
  new Vector3(CLUMP_RADIUS, CLUMP_RADIUS, CLUMP_RADIUS)
)

export function getNextBlockPosition(blocks: Object3D[]): Vector3 {
  const shadowIsOneBlock = xyEqualInGroup(blocks)
  const neighbors: Vector3[] = []
  for (const block of blocks) {
    for (const neighbor of get6Neighbors(block.position)) {
      if (!clumpBoundingBox.containsPoint(neighbor)) continue
      if (blocks.some((b) => b.position.equals(neighbor))) continue
      if (shadowIsOneBlock && xyIsEqual(block.position, neighbor)) continue
      neighbors.push(neighbor)
    }
  }
  if (neighbors.length === 0) throw 'No eligible neighbors found'
  return pickRandom(neighbors)
}

const blockGeometry = new BoxGeometry()
export function addBlockToClump(clump: Clump, position: Vector3) {
  const newBlock = new Mesh(blockGeometry, getBlockMaterial())
  newBlock.position.copy(position)
  newBlock.updateMatrix()
  clump.container.add(newBlock)
  clump.blocks.push(newBlock)
}

// Pitch up, yaw left, roll left
const randomAxes = [CardinalAxes[0], CardinalAxes[2], CardinalAxes[4]] as const
export function randomizeRotation(blocks: Mesh[]) {
  if (blocks.length === 1) return
  const shadowIsOneBlock = xyEqualInGroup(blocks)
  let attempts = 0
  const clump = blocks.map((b) => b.clone())
  do {
    // Rotate until clump does not fit in shadow
    randomAxes.forEach((axis) => {
      const rotations = randomInt(0, 3)
      for (let i = 0; i < rotations; i++) {
        rotateBlocks(blocks, axis)
      }
    })
    // No rotation will cause a one-block-shadow clump to be invalid
    if (shadowIsOneBlock) break
    attempts++
  } while (getInvalidBlocks(clump, blocks).length === 0 && attempts < 100)
}

export interface Wall {
  mesh: Mesh
  holeBlocks: Object3D[]
}

const wallMaterial = new MeshPhongMaterial({ color: '#d22573', transparent: true })
export function createWall(blocks: Mesh[]): Wall {
  wallMaterial.opacity = 1
  const wall: Wall = {
    mesh: new Mesh(new BoxGeometry(WALL_SIZE, WALL_SIZE, 1), wallMaterial),
    holeBlocks: [],
  }
  for (const block of blocks) {
    const flatBlock = block.clone()
    flatBlock.position.z = 0
    flatBlock.updateMatrix()
    wall.mesh = CSG.subtract(wall.mesh, flatBlock)
    if (!wall.holeBlocks.some((hb) => xyIsEqual(hb.position, flatBlock.position))) {
      wall.holeBlocks.push(flatBlock)
    }
  }
  const wallGrid = new GridHelper(WALL_SIZE, WALL_SIZE, 0, '#5b1b38')
  wallGrid.position.z = -0.5
  wallGrid.rotateX(Math.PI / 2)
  wall.mesh.add(wallGrid)
  return wall
}

export function rotateBlocks(blocks: Object3D[], axis: Vector3) {
  blocks.forEach((block) => {
    block.position.applyAxisAngle(axis, Math.PI / 2)
    block.position.round()
  })
}

function getInvalidBlocks(blocks: Mesh[], holeBlocks: Object3D[]): Mesh[] {
  return blocks.filter(
    (clumpBlock) => !holeBlocks.some((hb) => xyIsEqual(hb.position, clumpBlock.position))
  )
}

export function getInvalidBlocksAtZ(blocks: Mesh[], holeBlocks: Object3D[], z: number): Mesh[] {
  return getInvalidBlocks(blocks, holeBlocks).filter((b) => b.position.z === z)
}

export function removeBlocksFromClump(clump: Clump, removeBlocks: Mesh[]) {
  removeBlocks.forEach((b) => {
    b.removeFromParent()
    b.geometry.dispose()
  })
  clump.blocks = <Mesh[]>[...clump.container.children]
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
    shadow = CSG.union(shadow, flatBlock)
  }
  shadow!.material = shadowMaterial
  shadow!.scale[axis] = 0.001
  return shadow!
}

function getClumpShadows(blocks: Mesh[]): Object3D {
  const shadowContainer = new Object3D()
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
  puzzle.clump.shadow = getClumpShadows(puzzle.clump.blocks)
  puzzle.scene.add(puzzle.clump.shadow)
}
