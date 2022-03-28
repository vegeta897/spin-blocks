import './style.css'
import {
  AmbientLight,
  AxesHelper,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { createPuzzle, createBlocks, createWall, createClump } from './puzzle'

const scene = new Scene()
scene.background = new Color('#330f1f')
const camera = new PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 100)
const renderer = new WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const axesHelper = new AxesHelper(3)
axesHelper.position.set(0, 0, -19)
scene.add(axesHelper)

const puzzleBlockCoords = createPuzzle()
const blocks = createBlocks(puzzleBlockCoords)
const clump = createClump(blocks)
const wall = createWall(blocks)
scene.add(clump)
scene.add(wall)

camera.position.set(8, 0, 5)
camera.lookAt(new Vector3(0, 0, -10))

const ambientLight = new AmbientLight('#5d275d', 1)
scene.add(ambientLight)
const directionalLight = new DirectionalLight(0xffffff, 1)
directionalLight.position.set(-20, 30, 0)
directionalLight.target.position.copy(wall.position)
scene.add(directionalLight)
scene.add(directionalLight.target)

function animate() {
  requestAnimationFrame(animate)
  wall.position.z += 0.1
  if (wall.position.z >= 5) wall.position.z = -20
  renderer.render(scene, camera)
}
animate()

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
})
