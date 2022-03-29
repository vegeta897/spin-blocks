<script lang="ts">
  import { initRenderer } from './game'
  import { onMount } from 'svelte'
  import HUD from './HUD.svelte'

  let threeCanvas: HTMLCanvasElement
  onMount(() => {
    initRenderer(threeCanvas)
  })
</script>

<main>
  <canvas bind:this={threeCanvas} />
  <HUD />
</main>

<style>
</style>
