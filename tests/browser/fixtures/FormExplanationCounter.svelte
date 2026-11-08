<script lang="ts">
  let { id }: { id: string } = $props();
  let value = $state(0);
</script>

<button type="button" data-counter={id} onclick={() => { value += 1; }}>{id}: {value}</button>
