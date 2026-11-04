<script lang="ts">
  let count = $state(0);
</script>

<input aria-label="Skeleton node draft" value="Initial node draft" />
<button type="button" onclick={() => count++}>Node counter {count}</button>
