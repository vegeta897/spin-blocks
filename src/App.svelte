<script lang="ts" context="module">
  import { initGame, stopGame } from './game'
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import HUD from './HUD.svelte'

  let threeCanvas: HTMLCanvasElement
  let hasFocus = false

  onMount(() => {
    if (document.hasFocus()) {
      initGame(threeCanvas)
      hasFocus = true
    } else {
      window.addEventListener('focus', () => {
        initGame(threeCanvas)
        hasFocus = true
      })
    }
  })
  onDestroy(() => {
    stopGame()
  })
</script>

<main>
  <canvas bind:this={threeCanvas} />
  {#if hasFocus}
    <HUD />
  {:else}
    <h1>Click to focus game</h1>
  {/if}
</main>

<style>
  h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    color: #c8ff00;
    font-size: 8vh;
  }
</style>
