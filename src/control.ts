import { Quaternion, Vector3 } from 'three'
import { Clump, rotateBlocks } from './puzzle'

let rotationIndex: false | number = false

let rotateFrame = 0
const rotateFrames = 12
export function renderClump(clump: Clump) {
  if (rotationIndex === false) return
  rotateFrame++
  clump.container.quaternion.rotateTowards(
    rotationQuaternions[rotationIndex],
    Math.PI / 2 / rotateFrames
  )
  if (rotateFrame === rotateFrames) {
    clump.container.rotation.set(0, 0, 0)
    rotateBlocks(clump.blocks, ...rotations[rotationIndex])
    rotationIndex = false
    rotateFrame = 0
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (rotationIndex) return
  if (e.repeat) return
  if (!isGameKey(e.code)) return
  e.preventDefault()
  rotationIndex = gameKeys.indexOf(e.code)
}

const isGameKey = (key: string): key is GameKey => gameKeys.includes(key as GameKey)
type GameKey = typeof gameKeys[number]
const gameKeys = ['KeyS', 'KeyW', 'KeyA', 'KeyD', 'KeyQ', 'KeyE'] as const
const rotations: [Vector3, number][] = [
  [new Vector3(1, 0, 0), Math.PI / 2],
  [new Vector3(1, 0, 0), -Math.PI / 2],
  [new Vector3(0, 1, 0), Math.PI / 2],
  [new Vector3(0, 1, 0), -Math.PI / 2],
  [new Vector3(0, 0, 1), Math.PI / 2],
  [new Vector3(0, 0, 1), -Math.PI / 2],
]
const rotationQuaternions = rotations.map(([axis, angle]) =>
  new Quaternion().setFromAxisAngle(axis, angle)
)

export function initControls() {
  window.addEventListener('keydown', onKeyDown)
}

export function stopControls() {
  window.removeEventListener('keydown', onKeyDown)
}
