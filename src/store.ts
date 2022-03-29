import { Writable, writable } from 'svelte/store'
console.log('store init')
export const blockCount: Writable<number> = writable(6)
