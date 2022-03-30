import { Quaternion } from 'three'
import { Clump, rotateBlocks } from './puzzle'
import { CardinalAxes } from './util'
import { cubicOut } from '@gamestdio/easing'
import { turbo } from './loop'

let rotationIndex: false | number = false

let controlsLocked = false
export const lockControls = () => (controlsLocked = true)
export const unlockControls = () => (controlsLocked = false)

let rotateFrame = 0
const rotateFrames = 10
const easedSteps: number[] = []
for (let i = 1; i <= rotateFrames; i++) {
  const easedDelta = cubicOut(i / rotateFrames) - cubicOut((i - 1) / rotateFrames)
  easedSteps.push((Math.PI / 2) * easedDelta)
}
export function animateClump(clump: Clump) {
  if (rotationIndex === false) return
  clump.container.quaternion.rotateTowards(
    rotationQuaternions[rotationIndex],
    easedSteps[rotateFrame]
  )
  rotateFrame++
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
  if (e.code === 'Space') {
    turbo()
  } else {
    rotationIndex = gameKeys.indexOf(e.code)
  }
}

const isGameKey = (key: string): key is GameKey => gameKeys.includes(key as GameKey)
type GameKey = typeof gameKeys[number]
// Key list matches order of CardinalAxes
const gameKeys = ['KeyS', 'KeyW', 'KeyA', 'KeyD', 'KeyQ', 'KeyE', 'Space'] as const
const rotationQuaternions = CardinalAxes.map((axis) =>
  new Quaternion().setFromAxisAngle(axis, Math.PI / 2)
)

export function initControls() {
  window.addEventListener('keydown', onKeyDown)
}

export function stopControls() {
  window.removeEventListener('keydown', onKeyDown)
}
