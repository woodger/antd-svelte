<script lang="ts">
  let count = $state(0);
</script>

<span>Alpha <button type="button" data-menu-count onclick={event => {
  event.stopPropagation();
  count++;
}}>{count}</button><input aria-label="Menu draft" value="Seed"
  onclick={event => event.stopPropagation()} /></span>
