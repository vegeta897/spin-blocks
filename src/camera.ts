import { PerspectiveCamera, Vector3 } from 'three'
import { sineOut } from '@gamestdio/easing'

const LEFT = -4.5
const RIGHT = 4.5
const TOP = 4.5
const BOTTOM = -4.5

let cameraX = 0
let cameraY = 0

window.addEventListener('mousemove', (e) => {
  const halfWidth = window.innerWidth / 2
  if (e.offsetX > halfWidth) {
    cameraX = sineOut((e.offsetX - halfWidth) / halfWidth) * LEFT
  } else {
    cameraX = sineOut(1 - e.offsetX / halfWidth) * RIGHT
  }
  const halfHeight = window.innerHeight / 2
  if (e.offsetY > halfHeight) {
    cameraY = sineOut((e.offsetY - halfHeight) / halfHeight) * TOP
  } else {
    cameraY = sineOut(1 - e.offsetY / halfHeight) * BOTTOM
  }
})

const lookAt = new Vector3(0, 0, -10)

export function updateCamera(camera: PerspectiveCamera) {
  camera.position.set(cameraX, cameraY, 7)
  camera.lookAt(lookAt)
}
