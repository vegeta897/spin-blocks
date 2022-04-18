import { Writable, writable } from 'svelte/store'
export const blockCount: Writable<number> = writable(1)
export const gameState: Writable<'loading' | 'initialized' | 'running' | 'stopped'> =
  writable('loading')
export const focused: Writable<boolean> = writable(false)
