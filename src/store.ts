import { Writable, writable } from 'svelte/store'
export const blockCount: Writable<number> = writable(6)
export const gameState: Writable<'loading' | 'initialized' | 'running' | 'stopped'> =
  writable('loading')
