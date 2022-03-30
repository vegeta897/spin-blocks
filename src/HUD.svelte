<script lang="ts">
  import { blockCount } from './store'
</script>

<div id="HUD">
  <!--  <h2>spinblocks</h2>-->
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
    color: #c8ff00;
    text-shadow: 2px 2px 5px #491630a0;
    /*text-shadow: 4px 4px 10px #491630d0;*/
    /*font-size: 10em;*/
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
