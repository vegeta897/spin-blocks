<script lang="ts" context="module">
  import { initGame, startGame, stopGame } from './game'
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { focused, devMode } from './store'
  import HUD from './HUD.svelte'

  let threeCanvas: HTMLCanvasElement

  onMount(() => {
    initGame(threeCanvas)
    startGame()
    focused.set(document.hasFocus())
    window.addEventListener('focus', () => {
      focused.set(true)
    })
    window.addEventListener('blur', () => {
      focused.set(false)
    })
  })
  onDestroy(() => {
    stopGame()
  })
</script>

<main>
  <canvas class:blur={!$focused && !$devMode} bind:this={threeCanvas} />
  {#if $focused || $devMode}
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
    text-shadow: 2px 2px 5px #491630a0;
    font-size: 8vh;
  }
  .blur {
    filter: blur(40px) brightness(0.7);
  }
  canvas {
    transition: 200ms filter ease-out;
  }
</style>
