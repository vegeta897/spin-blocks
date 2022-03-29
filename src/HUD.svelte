<script lang="ts">
  import { blockCount } from './store'
</script>

<div id="HUD">
  <h2>{$blockCount}<small>block{$blockCount > 1 ? 's' : ''}</small></h2>
</div>

<style>
  #HUD {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-top: 2em;
    user-select: none;
  }
  h2 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 5em;
    font-weight: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  h2 small {
    font-size: 0.4em;
    margin-top: -0.6em;
  }
</style>
