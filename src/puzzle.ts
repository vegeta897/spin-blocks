import {
  Box3,
  BoxGeometry,
  GridHelper,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Scene,
  Vector3,
} from 'three'
import { CSG } from 'three-csg-ts'
import { CardinalAxes, get6Neighbors, pickRandom, randomInt, xyIsEqual } from './util'
import { get } from 'svelte/store'
import { blockCount } from './store'

const CLUMP_DIAMETER = 7
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
}

export function createPuzzle(scene: Scene): Puzzle {
  const clump = createClump()
  const wall = createWall(clump.blocks)
  wall.mesh.position.z = -50
  randomizeRotation(clump.blocks)
  scene.add(wall.mesh)
  scene.add(clump.container)
  return {
    clump,
    wall,
    scene,
  }
}

export function createClump(): Clump {
  const clump: Clump = {
    container: new Object3D(),
    blocks: [],
  }
  addBlockToClump(clump, new Vector3())
  while (clump.blocks.length < get(blockCount)) {
    addBlockToClump(clump, getNextBlockPosition(clump))
  }
  // TODO: Center result on 0,0
  return clump
}

const clumpBoundingBox = new Box3(
  new Vector3(-CLUMP_RADIUS, -CLUMP_RADIUS, -CLUMP_RADIUS),
  new Vector3(CLUMP_RADIUS, CLUMP_RADIUS, CLUMP_RADIUS)
)

export function getNextBlockPosition(clump: Clump): Vector3 {
  const neighbors: Vector3[] = []
  for (const block of clump.blocks) {
    for (const neighbor of get6Neighbors(block.position)) {
      if (!clumpBoundingBox.containsPoint(neighbor)) continue
      if (clump.blocks.some((b) => b.position.equals(neighbor))) continue
      neighbors.push(neighbor)
    }
  }
  if (neighbors.length === 0) throw 'No eligible neighbors found'
  return pickRandom(neighbors)
}

const colors = [
  '#fcba15',
  '#e5fc15',
  '#94fc15',
  '#15fc43',
  '#07ecd9',
  '#3290ff',
  '#3c46ff',
  '#6d3cff',
  '#7e26ff',
  '#ab06ff',
  '#ff06f3',
  '#ff0089',
  '#ff0000',
]
let color = 0

export function addBlockToClump(clump: Clump, position: Vector3) {
  const newBlock = new Mesh(
    new BoxGeometry(),
    new MeshPhongMaterial({ color: colors[color++ % colors.length] })
  )
  newBlock.position.copy(position)
  newBlock.updateMatrix()
  clump.container.attach(newBlock)
  clump.blocks.push(newBlock)
}

export function randomizeRotation(blocks: Object3D[]) {
  // Pitch up, yaw left, roll left
  ;[CardinalAxes[0], CardinalAxes[2], CardinalAxes[4]].forEach((axis) => {
    const rotations = randomInt(0, 3)
    for (let i = 0; i < rotations; i++) {
      rotateBlocks(blocks, axis)
    }
  })
  // TODO: Ensure final result does not equal initial state
  // And ensure final result won't fit in hole of initial state
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

export function getInvalidBlocks(clump: Clump, wall: Wall, z: number): Mesh[] {
  return clump.blocks.filter(
    (clumpBlock) =>
      clumpBlock.position.z === z &&
      !wall.holeBlocks.some((hb) => xyIsEqual(hb.position, clumpBlock.position))
  )
}

export function removeBlocks(clump: Clump, removeBlocks: Mesh[]) {
  removeBlocks.forEach((b) => {
    b.removeFromParent()
    b.geometry.dispose()
  })
  clump.blocks = <Mesh[]>[...clump.container.children]
}
