<script lang="ts">
  import { initRenderer } from './game'
  import { onMount } from 'svelte'
  let name: string = 'world'

  let threeCanvas: HTMLCanvasElement
  onMount(() => {
    initRenderer(threeCanvas)
  })
</script>

<main>
  <canvas bind:this={threeCanvas} />
  <h1>Hello {name}!</h1>
</main>

<style>
  main {
    position: relative;
  }
  main > * {
    position: absolute;
    top: 0;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
    font-family: 'Arial Black', serif;
  }
</style>
