import './style.css'
import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'

const scene = new Scene()
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const wallGeometry = new BoxGeometry(10, 10, 1)
const wallMaterial = new MeshBasicMaterial({ color: '#d22573' })
const wall = new Mesh(wallGeometry, wallMaterial)
wall.position.z = -20
scene.add(wall)
camera.position.x = 3
camera.lookAt(new Vector3(0, 0, -10))

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()
