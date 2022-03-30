<script lang="ts" context="module">
  import { initGame, startGame, stopGame } from './game'
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { gameState } from './store'
  import HUD from './HUD.svelte'

  let threeCanvas: HTMLCanvasElement

  onMount(() => {
    const restarting = get(gameState) === 'stopped'
    initGame(threeCanvas)
    if (document.hasFocus() || restarting) {
      startGame()
    } else {
      window.addEventListener('focus', () => {
        startGame()
      })
    }
  })
  onDestroy(() => {
    stopGame()
  })
</script>

<main>
  <canvas class:blur={$gameState !== 'running'} bind:this={threeCanvas} />
  {#if $gameState === 'running'}
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
    filter: blur(40px) brightness(0.5);
  }
</style>
