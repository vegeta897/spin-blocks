<script lang="ts" context="module">
  import { initGame, stopGame } from './game'
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import HUD from './HUD.svelte'
  let threeCanvas: HTMLCanvasElement
  onMount(() => {
    initGame(threeCanvas)
  })
  onDestroy(() => {
    stopGame()
  })
</script>

<main>
  <canvas bind:this={threeCanvas} />
  <HUD />
</main>

<style>
</style>
