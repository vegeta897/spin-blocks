import { BoxGeometry, Mesh, MeshPhongMaterial, Object3D, Vector3 } from 'three'
import { CSG } from 'three-csg-ts'
import { get6Neighbors, pickRandom } from './util'
import { get } from 'svelte/store'
import { blockCount } from './store'

const SIZE = 7
const HALF = Math.floor(SIZE / 2)

const vec3ToString = (vec3: Vector3): string => vec3.toArray().join(':')
const stringToVec3 = (str: string): Vector3 =>
  new Vector3().fromArray(str.split(':').map((c) => +c))

export interface Clump {
  container: Object3D
  blocks: Mesh[]
  flatBlocks: Mesh[]
}

const colors = ['#fcba15', '#e5fc15', '#94fc15', '#15fc43', '#15fce9', '#1581fc']

export function createClump(): Clump {
  const clump: Clump = {
    container: new Object3D(),
    blocks: [],
    flatBlocks: [],
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
    if (!clump.flatBlocks.some((fb) => xyIsEqual(fb.position, block.position))) {
      const flatBlock = block.clone()
      flatBlock.position.z = 0
      flatBlock.updateMatrix()
      clump.flatBlocks.push(flatBlock)
    }
    clump.container.attach(block)
    clump.blocks.push(block)
    get6Neighbors(blockVector).forEach((neighborVector) => {
      if (neighborVector.length() <= HALF) nextBlocks.add(vec3ToString(neighborVector))
    })
  }
  clump.container.position.set(0, 0, 0)
  // TODO: Center result on 0,0
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

export function getInvalidBlocks(clump: Clump): Object3D[] {
  return clump.blocks.filter(
    (clumpBlock) =>
      !clump.flatBlocks.some((flatBlock) => xyIsEqual(flatBlock.position, clumpBlock.position))
  )
}

function xyIsEqual(v1: Vector3, v2: Vector3) {
  return v1.x === v2.x && v1.y === v2.y
}
