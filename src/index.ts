import './style.css'
import {
  AmbientLight,
  AxesHelper,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Quaternion,
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
axesHelper.position.set(0, -4.5, -10)
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
  wall.position.z += 0.2
  if (wall.position.z >= 5) wall.position.z = -50
  renderer.render(scene, camera)
}
animate()

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
})

const isGameKey = (key: string): key is GameKey => gameKeys.includes(key as GameKey)

window.addEventListener('keydown', (e) => {
  if (e.repeat) return
  if (!isGameKey(e.code)) return
  e.preventDefault()
  clump.quaternion.multiply(rotations[gameKeys.indexOf(e.code)])
  clump.updateMatrix()
  clump.geometry.applyMatrix4(clump.matrix)
  clump.rotation.set(0, 0, 0)
  clump.position.set(0, 0, 0)
})
type GameKey = typeof gameKeys[number]
const gameKeys = ['KeyW', 'KeyS', 'KeyD', 'KeyA', 'KeyQ', 'KeyE'] as const
const rotations = [
  new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2),
  new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2),
  new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2),
  new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2),
  new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
  new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2),
]
