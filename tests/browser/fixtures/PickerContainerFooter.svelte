<script lang="ts">
  let count = $state(0);
</script>

<button type="button" data-picker-count onclick={() => count++}>{count}</button>
<input aria-label="Picker footer draft" value="Footer draft" />
