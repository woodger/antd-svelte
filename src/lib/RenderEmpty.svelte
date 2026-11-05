<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { RenderEmptyComponent, RenderEmptyContent } from './types';
  import { useConfig } from './config-context';
  import DefaultRenderEmpty from './DefaultRenderEmpty.svelte';
  import RenderContent from './RenderContent.svelte';

  let { componentName, local, fallback, nullish = false }: {
    componentName: RenderEmptyComponent;
    local?: RenderEmptyContent;
    fallback: Snippet;
    nullish?: boolean;
  } = $props();
  const config = useConfig();
  let value = $derived(local !== undefined ? local : config.renderEmpty?.(componentName));
  let provided = $derived(local !== undefined || (nullish ? value != null : Boolean(value)));
</script>

{#if provided}<RenderContent {value} />
{:else if !nullish && config.renderEmpty}<DefaultRenderEmpty {componentName} />
{:else}{@render fallback()}{/if}
