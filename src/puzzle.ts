import { BoxGeometry, Mesh, MeshPhongMaterial, Object3D, Scene, Vector3 } from 'three'
import { CSG } from 'three-csg-ts'
import {
  CardinalAxes,
  get6Neighbors,
  pickRandom,
  randomInt,
  stringToVec3,
  vec3ToString,
} from './util'
import { get } from 'svelte/store'
import { blockCount } from './store'

const CLUMP_DIAMETER = 7
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
  const puzzleBlockCoords: Set<string> = new Set()
  const nextBlocks: Set<string> = new Set([vec3ToString(new Vector3())])
  let color = 0
  while (puzzleBlockCoords.size < get(blockCount) && nextBlocks.size > 0) {
    const nextBlock = pickRandom([...nextBlocks])
    nextBlocks.delete(nextBlock)
    puzzleBlockCoords.add(nextBlock)
    const blockVector = stringToVec3(nextBlock)
    const block = new Mesh(
      new BoxGeometry(),
      new MeshPhongMaterial({ color: colors[color++ % colors.length] })
    )
    block.position.copy(blockVector)
    block.updateMatrix()
    clump.container.attach(block)
    clump.blocks.push(block)
    get6Neighbors(blockVector).forEach((neighborVector) => {
      const neighborCoord = vec3ToString(neighborVector)
      if (neighborVector.length() > CLUMP_RADIUS) return
      if (puzzleBlockCoords.has(neighborCoord)) return
      nextBlocks.add(neighborCoord)
    })
  }
  clump.container.position.set(0, 0, 0)
  // TODO: Center result on 0,0
  return clump
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

const wallMaterial = new MeshPhongMaterial({ color: '#d22573' })
export function createWall(blocks: Mesh[]): Wall {
  const wall: Wall = {
    mesh: new Mesh(new BoxGeometry(9, 9, 1), wallMaterial),
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

function xyIsEqual(v1: Vector3, v2: Vector3) {
  return v1.x === v2.x && v1.y === v2.y
}
