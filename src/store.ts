import { Writable, writable } from 'svelte/store'

export const blocks: Writable<number> = writable(6)
