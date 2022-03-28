import { BoxGeometry, Mesh, MeshPhongMaterial, Object3D, Vector3 } from 'three'
import { CSG } from 'three-csg-ts'
import { get6Neighbors, pickRandom } from './util'

const SIZE = 7
const HALF = Math.floor(SIZE / 2)
const BLOCKS = 6

const vec3ToString = (vec3: Vector3): string => vec3.toArray().join(':')
const stringToVec3 = (str: string): Vector3 =>
  new Vector3().fromArray(str.split(':').map((c) => +c))

export function createPuzzle(): Set<string> {
  const puzzleBlockCoords: Set<string> = new Set()
  const nextBlocks: Set<string> = new Set([vec3ToString(new Vector3())])
  while (puzzleBlockCoords.size < BLOCKS && nextBlocks.size > 0) {
    const nextBlock = pickRandom([...nextBlocks])
    nextBlocks.delete(nextBlock)
    puzzleBlockCoords.add(nextBlock)
    get6Neighbors(stringToVec3(nextBlock)).forEach((neighborVector) => {
      if (neighborVector.length() <= HALF) nextBlocks.add(vec3ToString(neighborVector))
    })
  }
  // TODO: Center result on 0,0
  return puzzleBlockCoords
}

const colors = ['#fcba15', '#e5fc15', '#94fc15', '#15fc43', '#15fce9', '#1581fc']

export function createBlocks(puzzleBlockCoords: Set<string>): Mesh[] {
  let color = 0
  return [...puzzleBlockCoords].map((coord) => {
    const blockVector = stringToVec3(coord)
    const block = new Mesh(new BoxGeometry(), new MeshPhongMaterial({ color: colors[color++] }))
    block.position.copy(blockVector)
    block.updateMatrix()
    return block
  })
}

export function getFlatBlocks(puzzleBlocks: Mesh[]): Mesh[] {
  const flatBlocks: Mesh[] = []
  for (const block of puzzleBlocks) {
    if (flatBlocks.some((fb) => xyIsEqual(fb.position, block.position))) continue
    const flatBlock = block.clone()
    flatBlock.position.z = 0
    flatBlock.updateMatrix()
    flatBlocks.push(flatBlock)
  }
  return flatBlocks
}

export function createClump(puzzleBlocks: Mesh[]) {
  const clump = new Object3D()
  for (const puzzleBlock of puzzleBlocks) {
    clump.attach(puzzleBlock)
  }
  clump.position.set(0, 0, 0)
  return clump
}

export function createWall(flatBlocks: Mesh[]): Mesh {
  const wallMaterial = new MeshPhongMaterial({ color: '#d22573' })
  let wall: Mesh = new Mesh(new BoxGeometry(9, 9, 1), wallMaterial)
  for (const puzzleBlock of flatBlocks) {
    wall = CSG.subtract(wall, puzzleBlock)
  }
  return wall
}

export function rotateBlocks(puzzleBlocks: Object3D[], axis: Vector3, angle: number) {
  puzzleBlocks.forEach((block) => {
    block.position.applyAxisAngle(axis, angle)
    block.position.round()
  })
}

export function getInvalidBlocks(clumpBlocks: Object3D[], flatBlocks: Object3D[]): Object3D[] {
  return clumpBlocks.filter(
    (clumpBlock) =>
      !flatBlocks.some((flatBlock) => xyIsEqual(flatBlock.position, clumpBlock.position))
  )
}

function xyIsEqual(v1: Vector3, v2: Vector3) {
  return v1.x === v2.x && v1.y === v2.y
}
