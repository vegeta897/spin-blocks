import { Quaternion } from 'three'
import { Clump, rotateBlocks } from './puzzle'
import { CardinalAxes } from './util'

let rotationIndex: false | number = false

let controlsLocked = false
export const lockControls = () => (controlsLocked = true)
export const unlockControls = () => (controlsLocked = false)

let rotateFrame = 0
const rotateFrames = 10
export function animateClump(clump: Clump) {
  if (rotationIndex === false) return
  rotateFrame++
  clump.container.quaternion.rotateTowards(
    rotationQuaternions[rotationIndex],
    Math.PI / 2 / rotateFrames
  )
  if (rotateFrame === rotateFrames) {
    clump.container.rotation.set(0, 0, 0)
    rotateBlocks(clump.blocks, CardinalAxes[rotationIndex])
    rotationIndex = false
    rotateFrame = 0
    controlsLocked = false
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (controlsLocked) return
  if (e.repeat) return
  if (!isGameKey(e.code)) return
  e.preventDefault()
  controlsLocked = true
  rotationIndex = gameKeys.indexOf(e.code)
}

const isGameKey = (key: string): key is GameKey => gameKeys.includes(key as GameKey)
type GameKey = typeof gameKeys[number]
// Key list matches order of CardinalAxes
const gameKeys = ['KeyS', 'KeyW', 'KeyA', 'KeyD', 'KeyQ', 'KeyE'] as const
const rotationQuaternions = CardinalAxes.map((axis) =>
  new Quaternion().setFromAxisAngle(axis, Math.PI / 2)
)

export function initControls() {
  window.addEventListener('keydown', onKeyDown)
}

export function stopControls() {
  window.removeEventListener('keydown', onKeyDown)
}
