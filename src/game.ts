import {
  AmbientLight,
  AxesHelper,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import { createWall, createClump, randomizeRotation } from './puzzle'
import { initControls, animateClump, stopControls } from './control'
import { initCamera, stopCamera, updateCamera } from './camera'
import { update } from './loop'

const TICK_RATE = 60
const TICK_TIME = 1000 / TICK_RATE

const gameInstance = Math.floor(Math.random() * 100000)
console.log(`game.ts init ${gameInstance}`)

let gameState: undefined | 'running' | 'stopped'

const scene = new Scene()
scene.background = new Color('#330f1f')
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
let renderer: WebGLRenderer

const axesHelper = new AxesHelper(3)
axesHelper.position.set(0, -4.5, -10)
scene.add(axesHelper)

const clump = createClump()
randomizeRotation(clump.blocks)
const wall = createWall(clump.flatBlocks)
wall.position.z = -50
scene.add(wall)
scene.add(clump.container)

const ambientLight = new AmbientLight('#6b566b', 1)
scene.add(ambientLight)
const directionalLight = new DirectionalLight(0xffffff, 1)
directionalLight.position.set(20, 30, 0)
directionalLight.target.position.set(0, 0, -50)
scene.add(directionalLight)
scene.add(directionalLight.target)

let lag: number
let lastUpdate: number
function animate() {
  if (gameState === 'stopped') return
  const now = performance.now()
  let delta = now - lastUpdate
  if (delta > 1000) delta = 1000
  lag += delta
  while (lag >= TICK_TIME) {
    update(wall, clump)
    animateClump(clump)
    lag -= TICK_TIME
  }
  lastUpdate = now
  requestAnimationFrame(animate)
  updateCamera(camera)
  renderer.render(scene, camera)
}

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

export const initGame = (canvas: HTMLCanvasElement) => {
  renderer = new WebGLRenderer({ antialias: true, canvas })
  renderer.setPixelRatio(window.devicePixelRatio)
  resize()
  if (!gameState) {
    lag = 0
    lastUpdate = performance.now()
    animate()
    initCamera()
    initControls()
    window.addEventListener('resize', resize)
    gameState = 'running'
  }
}

export const stopGame = () => {
  gameState = 'stopped'
  renderer.dispose()
  stopCamera()
  stopControls()
  window.removeEventListener('resize', resize)
}
