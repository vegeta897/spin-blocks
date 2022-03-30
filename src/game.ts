import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import { createPuzzle, WALL_SIZE } from './puzzle'
import { initControls, animateClump, stopControls } from './control'
import { initCamera, stopCamera, updateCamera } from './camera'
import { update } from './loop'

const TICK_RATE = 60
const TICK_TIME = 1000 / TICK_RATE

let gameState: undefined | 'running' | 'stopped'

const scene = new Scene()
scene.background = new Color('#330f1f')
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
let renderer: WebGLRenderer

const ambientLight = new AmbientLight('#6b566b', 1)
scene.add(ambientLight)
const directionalLight = new DirectionalLight(0xffffff, 1)
directionalLight.position.set(20, 30, 0)
directionalLight.target.position.set(0, 0, -50)
scene.add(directionalLight)
scene.add(directionalLight.target)

const gridTopBottom = new Object3D()
const gridBottom = new GridHelper(WALL_SIZE, WALL_SIZE, 0, '#981e56')
gridBottom.position.y = -WALL_SIZE / 2
gridTopBottom.add(gridBottom)
const gridTop = gridBottom.clone()
gridTop.position.y = WALL_SIZE / 2
gridTopBottom.add(gridTop)
const gridLeftRight = gridTopBottom.clone()
gridLeftRight.rotateZ(Math.PI / 2)
scene.add(gridTopBottom)
scene.add(gridLeftRight)

const puzzle = createPuzzle(scene)

let lag: number
let lastUpdate: number
function animate() {
  if (gameState === 'stopped') return
  const now = performance.now()
  let delta = now - lastUpdate
  if (delta > 1000) delta = 1000
  lag += delta
  while (lag >= TICK_TIME) {
    update(puzzle)
    animateClump(puzzle.clump)
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
