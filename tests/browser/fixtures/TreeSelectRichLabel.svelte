<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from 'antd-svelte';

  let { node, field, labelField, version, interactive, onLife }: {
    node: Record<string, unknown>;
    field: string;
    labelField: string;
    version: 'Old' | 'New';
    interactive: boolean;
    onLife: (event: string) => void;
  } = $props();

  const tokens = theme.useToken();
  const id = $props.id();
  let context = $derived(tokens.token.colorPrimary === '#1254a0' ? 'header'
    : tokens.token.colorPrimary === '#2ea050' ? 'callback' : 'unbound');
  let value = $derived(String(node[field] ?? '?'));
  let payload = $derived((node.payload as { id?: string | number; } | undefined)?.id ?? '?');
  let count = $state(0);

  onMount(() => {
    if (!interactive) return;
    const name = `${context}:${value}`;
    onLife(`mount:${name}`);
    return () => onLife(`destroy:${name}`);
  });
</script>

{#snippet content(value: unknown)}{#if Array.isArray(value)}{#each value as part}{@render content(part)}{/each}{:else if typeof value === 'string' || typeof value === 'number'}{value}{/if}{/snippet}

<svelte:head>
  {#if interactive}<meta data-tree-label-head={`${context}:${value}`} content={version} />{/if}
</svelte:head>
<em data-render-label data-render-value={value} data-render-payload={payload}
  data-render-context={context}>{version}|{context}|{@render content(node[labelField])}{#if interactive}<input id={id}
    aria-label={`${context} label draft ${value}`} value="Label draft" /><button type="button"
    onclick={() => { count++; }}>Count {count}</button>{/if}</em>
