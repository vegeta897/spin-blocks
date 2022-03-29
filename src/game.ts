import {
  AmbientLight,
  AxesHelper,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import {
  createPuzzle,
  createBlocks,
  createWall,
  createClump,
  getFlatBlocks,
  getInvalidBlocks,
} from './puzzle'
import { renderClump } from './control'
import { updateCamera } from './camera'

const scene = new Scene()
scene.background = new Color('#330f1f')
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
let renderer: WebGLRenderer

export const initRenderer = (canvas: HTMLCanvasElement) => {
  const coldStart = !renderer
  renderer = new WebGLRenderer({ antialias: true, canvas })
  renderer.setPixelRatio(window.devicePixelRatio)
  resize()
  if (coldStart) animate()
}

const axesHelper = new AxesHelper(3)
axesHelper.position.set(0, -4.5, -10)
scene.add(axesHelper)

const puzzleBlockCoords = createPuzzle()
const blocks = createBlocks(puzzleBlockCoords)
const flatBlocks = getFlatBlocks(blocks)
const wall = createWall(flatBlocks)
wall.position.z = -50
const clump = createClump(blocks)
scene.add(wall)
scene.add(clump)

const ambientLight = new AmbientLight('#5d275d', 1)
scene.add(ambientLight)
const directionalLight = new DirectionalLight(0xffffff, 1)
directionalLight.position.set(20, 30, 0)
directionalLight.target.position.set(0, 0, -50)
scene.add(directionalLight)
scene.add(directionalLight.target)

function animate() {
  requestAnimationFrame(animate)
  wall.position.z += 0.15
  if (wall.position.z >= 3) {
    wall.position.z = -50
    const invalidBlocks = getInvalidBlocks(clump.children, flatBlocks)
    invalidBlocks.forEach((b) => b.removeFromParent())
  }
  renderClump(clump)
  updateCamera(camera)
  renderer.render(scene, camera)
}

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', resize)
