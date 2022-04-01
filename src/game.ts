import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Object3D,
  Scene,
  WebGLRenderer,
} from 'three'
import { createPuzzle, WALL_SIZE } from './puzzle'
import { initControls, animateClump, stopControls } from './control'
import { getCamera, initCamera, resizeCamera, stopCamera, updateCamera } from './camera'
import { update } from './loop'
import { gameState } from './store'
import { get } from 'svelte/store'
import { Ticker } from './util'

const TICK_RATE = 60

const scene = new Scene()
scene.background = new Color('#330f1f')
let renderer: WebGLRenderer

const ambientLight = new AmbientLight('#6b566b', 1)
const directionalLight = new DirectionalLight(0xffffff, 1)
directionalLight.position.set(20, 30, 0)
directionalLight.target.position.set(0, 0, -50)
scene.add(ambientLight, directionalLight, directionalLight.target)

const gridTopBottom = new Object3D()
const gridBottom = new GridHelper(WALL_SIZE, WALL_SIZE, 0, '#981e56')
gridBottom.position.y = -WALL_SIZE / 2
const gridTop = gridBottom.clone()
gridTop.position.y = WALL_SIZE / 2
gridTopBottom.add(gridBottom, gridTop)
const gridLeftRight = gridTopBottom.clone()
gridLeftRight.rotateZ(Math.PI / 2)
scene.add(gridTopBottom, gridLeftRight)

const puzzle = createPuzzle(scene)

let _gameState = get(gameState)
gameState.subscribe((gs) => (_gameState = gs))

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  resizeCamera()
}

let ticker: Ticker

export const initGame = (canvas: HTMLCanvasElement) => {
  gameState.set('initialized')
  renderer = new WebGLRenderer({ antialias: true, canvas })
  renderer.setPixelRatio(window.devicePixelRatio)
  resize()
  updateCamera()
  const camera = getCamera()
  renderer.render(scene, camera)
  ticker = new Ticker(
    () => {
      update(puzzle)
      animateClump(puzzle)
    },
    (dt) => {
      updateCamera()
      renderer.render(scene, camera)
    },
    TICK_RATE
  )
}

export const startGame = () => {
  gameState.set('running')
  ticker.start()
  initCamera()
  initControls()
  window.addEventListener('resize', resize)
}

export const stopGame = () => {
  gameState.set('stopped')
  ticker.stop()
  renderer.dispose()
  stopCamera()
  stopControls()
  window.removeEventListener('resize', resize)
}
