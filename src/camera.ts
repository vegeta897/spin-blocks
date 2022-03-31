import { PerspectiveCamera, Vector3 } from 'three'
import { sineOut } from '@gamestdio/easing'
import { CLUMP_DIAMETER } from './puzzle'

const DEFAULT_FOV = 85

const LEFT = -4.5
const RIGHT = 4.5
const TOP = 4.5
const BOTTOM = -4.5

let cameraX = 0
let cameraY = 0

export const Camera = new PerspectiveCamera(
  DEFAULT_FOV,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

function onMouseMove(e: MouseEvent) {
  const halfWidth = window.innerWidth / 2
  if (e.clientX > halfWidth) {
    cameraX = sineOut((e.clientX - halfWidth) / halfWidth) * LEFT
  } else {
    cameraX = sineOut(1 - e.clientX / halfWidth) * RIGHT
  }
  const halfHeight = window.innerHeight / 2
  if (e.clientY > halfHeight) {
    cameraY = sineOut((e.clientY - halfHeight) / halfHeight) * TOP
  } else {
    cameraY = sineOut(1 - e.clientY / halfHeight) * BOTTOM
  }
}

export function initCamera() {
  window.addEventListener('mousemove', onMouseMove)
}

export function stopCamera() {
  window.removeEventListener('mousemove', onMouseMove)
}

const lookAt = new Vector3(0, 0, -10)

export function updateCamera() {
  Camera.position.set(cameraX, cameraY, CLUMP_DIAMETER / 2 + 5)
  Camera.lookAt(lookAt)
}

export function resizeCamera() {
  Camera.aspect = window.innerWidth / window.innerHeight
  Camera.updateProjectionMatrix()
}

export function zoomInCamera(fovDecrease: number) {
  Camera.fov = Math.max(45, Camera.fov - fovDecrease)
  Camera.updateProjectionMatrix()
}

export function zoomCameraToDefault() {
  if (Camera.fov === DEFAULT_FOV) return
  Camera.fov = Math.min(DEFAULT_FOV, Camera.fov + (DEFAULT_FOV - Camera.fov) / 5)
  Camera.updateProjectionMatrix()
}
