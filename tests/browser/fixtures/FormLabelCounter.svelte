<script lang="ts">
  let count = $state(0);
</script>

<button type="button" style="font:inherit" data-label-counter onclick={() => { count += 1; }}>
  Counter {count}
</button>
