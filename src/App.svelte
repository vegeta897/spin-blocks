<script lang="ts" context="module">
  import { initGame, stopGame } from './game'
  console.log('App.svelte module init')
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import HUD from './HUD.svelte'
  console.log('App.svelte component init')
  let threeCanvas: HTMLCanvasElement
  onMount(() => {
    console.log('app onMount')
    initGame(threeCanvas)
  })
  onDestroy(() => {
    console.log('app onDestroy')
    stopGame()
  })
</script>

<main>
  <canvas bind:this={threeCanvas} />
  <HUD />
</main>

<style>
</style>
