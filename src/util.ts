import { Vector3 } from 'three'

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

const cardinalDirections = [Right, Left, Up, Down, Forward, Back]

export function get6Neighbors(origin = new Vector3()): Vector3[] {
  return cardinalDirections.map((dir) => origin.clone().add(dir))
}

// Axes of rotation
export const PitchUp = Right
export const PitchDown = Left
export const YawLeft = Up
export const YawRight = Down
export const RollLeft = Forward
export const RollRight = Back
