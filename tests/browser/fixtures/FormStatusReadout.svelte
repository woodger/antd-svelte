<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useFormItemStatus } from 'antd-svelte';

  let { scope, children }: { scope: string; children?: Snippet } = $props();
  const state = useFormItemStatus();
</script>

<div>
  {@render children?.()}
  <output data-form-status-read={scope}>{JSON.stringify({
    status: state.status ?? null, errors: state.errors, warnings: state.warnings
  })}</output>
</div>
