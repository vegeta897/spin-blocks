import { PerspectiveCamera, Vector3 } from 'three'
import { sineOut } from '@gamestdio/easing'

const LEFT = -4.5
const RIGHT = 4.5
const TOP = 4.5
const BOTTOM = -4.5

let cameraX = 0
let cameraY = 0

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

export function updateCamera(camera: PerspectiveCamera) {
  camera.position.set(cameraX, cameraY, 7)
  camera.lookAt(lookAt)
}
