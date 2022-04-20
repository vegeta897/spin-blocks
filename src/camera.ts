import { PerspectiveCamera, Vector3 } from 'three'
import { sineOut } from '@gamestdio/easing'
import { CLUMP_DIAMETER } from './puzzle'

export const CAMERA_Z = CLUMP_DIAMETER / 2 + 5
const cameraTarget = new Vector3(0, 0, -10)
const DEFAULT_FOV = 85

const LEFT = -4.5
const RIGHT = 4.5
const TOP = 4.5
const BOTTOM = -4.5

let cameraX = 0
let cameraY = 0

const camera = new PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 0.1, 60)

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

export const getCamera = () => camera
export const initCamera = () => window.addEventListener('mousemove', onMouseMove)
export const stopCamera = () => window.removeEventListener('mousemove', onMouseMove)

export function updateCamera() {
  camera.position.set(cameraX, cameraY, CAMERA_Z)
  camera.lookAt(cameraTarget)
}

export function resizeCamera() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

export function zoomInCamera(fovDecrease: number) {
  camera.fov = Math.max(45, camera.fov - fovDecrease)
  camera.updateProjectionMatrix()
}

export function zoomCameraToDefault() {
  if (camera.fov === DEFAULT_FOV) return
  camera.fov = Math.min(DEFAULT_FOV, camera.fov + (DEFAULT_FOV - camera.fov) / 10)
  camera.updateProjectionMatrix()
}

export function zoomCameraTo(fov: number) {
  if (camera.fov === fov) return
  camera.fov = fov
  camera.updateProjectionMatrix()
}
