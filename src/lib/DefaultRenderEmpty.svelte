<script lang="ts">
  import type { RenderEmptyComponent } from './types';
  import Empty from './Empty.svelte';

  let { componentName }: { componentName?: RenderEmptyComponent; } = $props();
  let simple = $derived(componentName !== undefined);
  let small = $derived(componentName !== 'Table');
</script>

{#if componentName !== 'Table.filter'}<Empty
  image={simple ? 'simple' : 'default'} class={simple && small ? 'ant-empty-small' : undefined}
/>{/if}
