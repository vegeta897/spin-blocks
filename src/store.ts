import { Writable, writable } from 'svelte/store'
export const blockCount: Writable<number> = writable(6)
