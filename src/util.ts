import { MeshLambertMaterial, Vector3 } from 'three'

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const Right = new Vector3(1, 0, 0)
const Left = new Vector3(-1, 0, 0)
const Up = new Vector3(0, 1, 0)
const Down = new Vector3(0, -1, 0)
const Forward = new Vector3(0, 0, 1)
const Back = new Vector3(0, 0, -1)

export const CardinalAxes = [Right, Left, Up, Down, Forward, Back]

export function get6Neighbors(origin = new Vector3()): Vector3[] {
  return CardinalAxes.map((dir) => origin.clone().add(dir))
}

export function xyIsEqual(v1: Vector3, v2: Vector3): boolean {
  return v1.x === v2.x && v1.y === v2.y
}

export function xyEqualInAll(group: Vector3[]): boolean {
  return group.every((v) => xyIsEqual(v, group[0]))
}

export class Ticker {
  private readonly update: () => void
  private readonly animate: (dt: number) => void
  private _running = false
  private lag = 0
  private lastUpdate = 0
  private readonly tickTime: number
  get running(): boolean {
    return this._running
  }
  constructor(updateFn: () => void, animateFn: (dt: number) => void, tickRate: number) {
    this.update = updateFn
    this.animate = animateFn
    this.tickTime = 1000 / tickRate
  }
  start() {
    if (this._running) return
    this._running = true
    this.tick()
  }
  stop() {
    this._running = false
  }
  private tick() {
    if (!this._running) return
    const now = performance.now()
    let delta = now - this.lastUpdate
    if (delta > 1000) delta = 1000
    this.lag += delta
    while (this.lag >= this.tickTime) {
      this.update()
      this.lag -= this.tickTime
    }
    this.lastUpdate = now
    this.animate(delta)
    requestAnimationFrame(this.tick.bind(this))
  }
}

const blockMaterials = [
  '#fcba15',
  '#e5fc15',
  '#94fc15',
  '#15fc43',
  '#07ecd9',
  '#3290ff',
  '#3c46ff',
  '#6d3cff',
  '#7e26ff',
  '#ab06ff',
  '#ff06f3',
  '#ff0089',
  '#ff0000',
  '#ff5900',
].map((color) => new MeshLambertMaterial({ color }))
let color = 0
export const getBlockMaterial = () => blockMaterials[color++ % blockMaterials.length]
