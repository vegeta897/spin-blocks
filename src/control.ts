import { Object3D, Quaternion, Vector3 } from 'three'
import { rotateBlocks } from './puzzle'

window.addEventListener('keydown', (e) => {
  if (rotationIndex) return
  if (e.repeat) return
  if (!isGameKey(e.code)) return
  e.preventDefault()
  rotationIndex = gameKeys.indexOf(e.code)
})

let rotationIndex: false | number = false

let rotateFrame = 0
const rotateFrames = 12
export function renderClump(clump: Object3D) {
  if (rotationIndex === false) return
  rotateFrame++
  clump.quaternion.rotateTowards(rotationQuaternions[rotationIndex], Math.PI / 2 / rotateFrames)
  if (rotateFrame === rotateFrames) {
    clump.rotation.set(0, 0, 0)
    rotateBlocks(clump.children, ...rotations[rotationIndex])
    rotationIndex = false
    rotateFrame = 0
  }
}

const isGameKey = (key: string): key is GameKey => gameKeys.includes(key as GameKey)
type GameKey = typeof gameKeys[number]
const gameKeys = ['KeyS', 'KeyW', 'KeyA', 'KeyD', 'KeyQ', 'KeyE'] as const
const rotations: [Vector3, number][] = [
  [new Vector3(1, 0, 0), Math.PI / 2],
  [new Vector3(1, 0, 0), -Math.PI / 2],
  [new Vector3(0, 0, 1), Math.PI / 2],
  [new Vector3(0, 0, 1), -Math.PI / 2],
  [new Vector3(0, 1, 0), Math.PI / 2],
  [new Vector3(0, 1, 0), -Math.PI / 2],
]
const rotationQuaternions = rotations.map(([axis, angle]) =>
  new Quaternion().setFromAxisAngle(axis, angle)
)
