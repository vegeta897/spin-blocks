import { Quaternion, Vector3 } from 'three'
import { Clump, rotateBlocks } from './puzzle'
import { PitchDown, PitchUp, RollLeft, RollRight, YawLeft, YawRight } from './util'

let rotationIndex: false | number = false

let rotateFrame = 0
const rotateFrames = 12
export function animateClump(clump: Clump) {
  if (rotationIndex === false) return
  rotateFrame++
  clump.container.quaternion.rotateTowards(
    rotationQuaternions[rotationIndex],
    Math.PI / 2 / rotateFrames
  )
  if (rotateFrame === rotateFrames) {
    clump.container.rotation.set(0, 0, 0)
    rotateBlocks(clump.blocks, rotationAxes[rotationIndex])
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
const rotationAxes: Vector3[] = [PitchUp, PitchDown, YawLeft, YawRight, RollLeft, RollRight]
const rotationQuaternions = rotationAxes.map((axis) =>
  new Quaternion().setFromAxisAngle(axis, Math.PI / 2)
)

export function initControls() {
  window.addEventListener('keydown', onKeyDown)
}

export function stopControls() {
  window.removeEventListener('keydown', onKeyDown)
}
