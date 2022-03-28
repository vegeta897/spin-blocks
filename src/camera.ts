import { PerspectiveCamera, Vector3 } from 'three'

const LEFT = -4
const RIGHT = 4
const TOP = 4
const BOTTOM = -4

let cameraX = 0
let cameraY = 0

window.addEventListener('mousemove', (e) => {
  cameraX = (e.offsetX / window.innerWidth) * (RIGHT - LEFT) + LEFT
  cameraY = TOP - (e.offsetY / window.innerHeight) * (TOP - BOTTOM)
})

const lookAt = new Vector3(0, 0, -10)

export function updateCamera(camera: PerspectiveCamera) {
  camera.position.set(cameraX, cameraY, 7)
  camera.lookAt(lookAt)
}
