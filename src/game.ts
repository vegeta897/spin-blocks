import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Fog,
  GridHelper,
  Group,
  LineBasicMaterial,
  LineSegments,
  Scene,
  WebGLRenderer,
} from 'three'
import { createPuzzle, WALL_SIZE } from './puzzle'
import { initControls, animateClump, stopControls } from './control'
import { getCamera, initCamera, resizeCamera, stopCamera, updateCamera } from './camera'
import { update } from './loop'
import { devMode, gameState } from './store'
import { get } from 'svelte/store'
import { Ticker } from './util'
import Stats from 'stats.js'

const TICK_RATE = 60

const scene = new Scene()
const bgColor = new Color('#330f1f')
scene.background = bgColor
scene.fog = new Fog(bgColor, 40, 55)
let renderer: WebGLRenderer

const ambientLight = new AmbientLight('#6b566b', 1)
const directionalLight = new DirectionalLight(0xffffff, 1)
directionalLight.position.set(20, 30, 0)
directionalLight.target.position.set(0, 0, -50)
scene.add(ambientLight, directionalLight, directionalLight.target)

const gridTopBottom = new Group()
const gridBottom = new GridHelper(WALL_SIZE, WALL_SIZE, 0, '#981e56')
gridBottom.position.y = -WALL_SIZE / 2
const gridTop = gridBottom.clone()
gridTop.position.y = WALL_SIZE / 2
gridTopBottom.add(gridBottom, gridTop)
const gridLeftRight = gridTopBottom.clone()
gridLeftRight.rotateZ(Math.PI / 2)
scene.add(gridTopBottom, gridLeftRight)

const centerShaftGeometry = new BoxGeometry(0.99, 0.99, 60)
const centerShaftEdges = new EdgesGeometry(centerShaftGeometry)
const line = new LineSegments(centerShaftEdges, new LineBasicMaterial({ color: '#981e56' }))
line.position.z = -30.5
scene.add(line)

const puzzle = createPuzzle(scene)

let _gameState = get(gameState)
gameState.subscribe((gs) => (_gameState = gs))

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  resizeCamera()
}

const DEV_MODE = get(devMode)
let updateStats: Stats
let animateStats: Stats
if (DEV_MODE) {
  updateStats = new Stats()
  animateStats = new Stats()
  animateStats.dom.style.left = '80px'
  document.body.appendChild(updateStats.dom)
  document.body.appendChild(animateStats.dom)
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
      if (DEV_MODE) updateStats.begin()
      update(puzzle)
      animateClump(puzzle)
      if (DEV_MODE) updateStats.end()
    },
    (dt) => {
      if (DEV_MODE) animateStats.begin()
      updateCamera()
      renderer.render(scene, camera)
      if (DEV_MODE) animateStats.end()
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
