import { BoxGeometry, Mesh, MeshPhongMaterial } from 'three'
import { CSG } from 'three-csg-ts'
import { randomInt } from './util'

const SIZE = 7

const xyToCoord = (x: number, y: number): number => x * SIZE + y
const coordToXY = (coord: number): [number, number] => [Math.floor(coord / SIZE), coord % SIZE]

export function createPuzzle(): Set<number> {
  const puzzleBlockCoords: Set<number> = new Set()
  while (puzzleBlockCoords.size < 4) {
    const x = randomInt(0, SIZE - 1)
    const y = randomInt(0, SIZE - 1)
    console.log(x, y)
    puzzleBlockCoords.add(xyToCoord(x, y))
  }
  return puzzleBlockCoords
}

export function createBlocks(puzzleBlockCoords: Set<number>): Mesh[] {
  const blocksMaterial = new MeshPhongMaterial({ color: '#fcba15' })
  return [...puzzleBlockCoords].map((coord) => {
    const [x, y] = coordToXY(coord)
    const block = new Mesh(new BoxGeometry(), blocksMaterial)
    block.position.set(x - Math.floor(SIZE / 2), y - Math.floor(SIZE / 2), 0)
    block.updateMatrix()
    return block
  })
}

export function createClump(puzzleBlocks: Mesh[]) {
  let clump: Mesh = [...puzzleBlocks].pop()!
  for (const puzzleBlock of puzzleBlocks) {
    clump = CSG.union(clump, puzzleBlock)
  }
  return clump
}

export function createWall(puzzleBlocks: Mesh[]): Mesh {
  const wallMaterial = new MeshPhongMaterial({ color: '#d22573' })
  let wall: Mesh = new Mesh(new BoxGeometry(9, 9, 1), wallMaterial)
  for (const puzzleBlock of puzzleBlocks) {
    wall = CSG.subtract(wall, puzzleBlock)
  }
  wall.position.z = -20
  return wall
}
