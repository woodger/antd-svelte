<script lang="ts">
  let { class: className, style }: { class: string; style?: string; } = $props();
  let count = $state(0);
</script>

<span data-count-root class={['case-custom-count', className]}
  style={`${style ?? ''};display:inline-flex;align-items:center`}><input
  aria-label="Custom count draft" value="Seed" style="width:64px;font:inherit;line-height:16px" /><button
  type="button" aria-label="Custom count counter" style="padding:0;border:0;font:inherit"
  onclick={() => count++}>{count}</button></span>
