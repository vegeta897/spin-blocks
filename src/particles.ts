import { Vector3, Mesh, Quaternion, TetrahedronGeometry, Vector2 } from 'three'
import { randFloat, randFloatSpread } from 'three/src/math/MathUtils'
import { getBlockMaterial, pickRandom, randomInt } from './util'
import type { Puzzle } from './puzzle'
import { CAMERA_Z } from './camera'

export interface Particle {
  mesh: Mesh
  velocity: Vector3
  rotation: Quaternion
}

const v2Zero = new Vector2()
const v2 = new Vector2()
const v3 = new Vector3()
export function explodeBlock(block: Mesh, puzzle: Puzzle, turbo: boolean) {
  const fragments = randomInt(8, 16)
  for (let i = 0; i < fragments; i++) {
    const mesh = pickRandom(fragmentMeshes).clone()
    mesh.material = block.material
    mesh.position.copy(block.position)
    mesh.position.x += randFloatSpread(0.7)
    mesh.position.y += randFloatSpread(0.7)
    mesh.position.z += randFloatSpread(0.7)
    mesh.scale.setScalar(randFloat(0.08, 0.25))
    v2.set(turbo ? 0.1 : 0.06, 0).rotateAround(v2Zero, randFloat(0, Math.PI * 2))
    const velocity = new Vector3(v2.x, v2.y, (turbo ? 0.2 : 0.05) + randFloatSpread(0.01))
    const rotation = new Quaternion().setFromAxisAngle(v3.randomDirection(), randFloat(0.02, 0.2))
    puzzle.particles.add({ mesh, velocity, rotation })
    puzzle.scene.add(mesh)
  }
}

export function updateParticles(particles: Set<Particle>) {
  for (const particle of particles) {
    if (particle.mesh.position.z < CAMERA_Z - 1 || particle.mesh.position.lengthSq() > 10000) {
      particle.mesh.geometry.dispose()
      particle.mesh.removeFromParent()
      particles.delete(particle)
      continue
    }
    particle.mesh.position.add(particle.velocity)
    particle.mesh.quaternion.multiply(particle.rotation)
  }
}

const fragmentMeshes: Mesh[] = []
const vertex = new Vector3()
for (let i = 0; i < 16; i++) {
  const fragmentGeometry = new TetrahedronGeometry()
  const vertices: Map<string, Vector3> = new Map()
  const positionAttribute = fragmentGeometry.getAttribute('position')
  for (let p = 0; p < positionAttribute.count; p++) {
    vertex.fromBufferAttribute(positionAttribute, p)
    const vertexKey = vertex
      .toArray()
      .map((a) => Math.round(a * 100) / 100)
      .join(',')
    if (!vertices.has(vertexKey)) {
      vertices.set(vertexKey, new Vector3(...vertex.toArray().map((a) => a + randFloatSpread(0.8))))
    }
    positionAttribute.setXYZ(p, ...vertices.get(vertexKey)!.toArray())
  }
  const fragment = new Mesh(fragmentGeometry, getBlockMaterial())
  fragmentMeshes.push(fragment)
}
