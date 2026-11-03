<script lang="ts">
  let { label }: { label: string; } = $props();
  let count = $state(0);
</script>

<span data-ribbon-state={label}><input aria-label={`${label} draft`} value="Seed"
  style="width:64px;font:inherit;line-height:16px" /><button type="button"
  aria-label={`${label} counter`} onclick={() => count++}
  style="font:inherit;padding:0;border:0">{count}</button></span>
