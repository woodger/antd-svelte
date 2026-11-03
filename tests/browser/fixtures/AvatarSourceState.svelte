<script lang="ts">
  let count = $state(0);
</script>
<span data-source-state>
  <input aria-label="Source draft" value="Seed" style="width:64px" />
  <button type="button" data-source-count onclick={event => {
    event.stopPropagation();
    count++;
  }}>{count}</button>
</span>
