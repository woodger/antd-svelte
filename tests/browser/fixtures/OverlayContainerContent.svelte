<script lang="ts">
  let count = $state(0);
</script>

<div role="group" tabindex="-1" aria-label="Overlay content"
  style="width:200px;min-height:100px;background:white">
  <input aria-label="Overlay draft" value="Overlay draft" />
  <button type="button" data-overlay-count onclick={() => count++}>{count}</button>
</div>
