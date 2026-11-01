<script module lang="ts">
  import type { ListKey } from 'antd-svelte';
  export interface ListRecordData { key: ListKey; label: string; }
</script>

<script lang="ts">
  import { ListItem, ListItemMeta, type ListContent, type ListItemMetaRef } from 'antd-svelte';
  let {
    record,
    index,
    mode,
    extra,
    actions,
    semantic,
    localStyles,
    zero,
    nativeElement = $bindable(),
    metaNativeElement = $bindable(),
    metaRef = $bindable()
  }: {
    record: ListRecordData;
    index: number;
    mode: string;
    extra: ListContent;
    actions: boolean;
    semantic: boolean;
    localStyles: boolean;
    zero: boolean;
    nativeElement?: HTMLElement;
    metaNativeElement?: HTMLDivElement;
    metaRef?: ListItemMetaRef;
  } = $props();
  let clicks = $state(0);
  let content = $derived<ListContent>(mode === 'array' ? ['Before ', word, ' after']
    : mode === 'numeric' ? [0, word] : body);
</script>

<ListItem children={content} {extra}
  actions={actions ? [counter, action] : undefined}
  classNames={semantic ? { actions: 'local-actions', extra: 'local-extra' } : undefined}
  styles={localStyles ? { actions: 'color:blue', extra: 'color:blue' } : undefined}
  data-row={String(record.key)} data-index={index} bind:nativeElement>
</ListItem>

{#snippet body()}
  {#if mode === 'mixed'}Before <span>{record.label}</span> after
  {:else if mode === 'single'}Single text
  {:else}<ListItemMeta avatar={zero ? 0 : 'A'} title={zero ? 0 : title}
      description={zero ? 0 : `Index ${index}`} bind:nativeElement={metaNativeElement}
      bind:ref={metaRef} />{/if}
{/snippet}

{#snippet title()}<a href={`#${record.label}`}>{record.label}</a>{/snippet}
{#snippet word()}<span>{record.label}</span>{/snippet}
{#snippet counter()}
  <button type="button" aria-label={`Count ${record.label}`} onclick={() => clicks++}>{clicks}</button>
{/snippet}
{#snippet action()}<a href={`#inspect-${record.label}`}>Inspect {record.label}</a>{/snippet}
