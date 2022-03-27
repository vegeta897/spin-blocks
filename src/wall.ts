import { BoxGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial } from 'three'
import { CSG } from 'three-csg-ts'

export function createWall(): Mesh {
  const wallMaterial = new MeshPhongMaterial({ color: '#d22573' })
  const wall = new Mesh(new BoxGeometry(10, 10, 1), wallMaterial)

  const cube = new Mesh(new BoxGeometry(1, 1, 1))
  wall.updateMatrix()
  cube.updateMatrix()
  const cutWall = CSG.subtract(wall, cube)

  cutWall.position.z = -20
  return cutWall
}
