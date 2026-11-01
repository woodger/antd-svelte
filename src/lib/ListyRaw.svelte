<script lang="ts" generics="T, K extends ListyKey">
  import { listyRows } from './listy.engine';
  import { scrollRawListy } from './listy.dom';
  import type { ListyKey, ListyViewProps } from './listy.types';
  import ListyGroupHeader from './ListyGroupHeader.svelte';

  let {
    items,
    rowKey,
    group,
    itemRender,
    height,
    sticky,
    prefixCls,
    direction,
    classNames,
    styles,
    onScroll,
    attributes,
    ref = $bindable(),
    nativeElement = $bindable()
  }: ListyViewProps<T, K> = $props();

  let rows = $derived(listyRows(items, rowKey, group));

  $effect(() => {
    if (!nativeElement) return;
    ref = {
      scrollTo(config) {
        if (nativeElement) scrollRawListy(nativeElement, config, prefixCls, Boolean(sticky && group));
      }
    };
    return () => { ref = undefined; };
  });
</script>

{#snippet renderItem(row: import('./listy.engine').ListyItem<T>)}
  <div class={[`${prefixCls}-item`, classNames.item]} style={styles.item}
    data-key={row.taggedKey}>{@render itemRender(row.item, row.index)}</div>
{/snippet}

<div {...attributes} bind:this={nativeElement} dir={direction}
  class={[prefixCls, direction === 'rtl' && `${prefixCls}-rtl`, classNames.root]}
  style={[
    height !== undefined && `max-height:${height}px;overflow-y:auto`,
    'overflow-anchor:none',
    styles.root
  ].filter(Boolean).join(';')} onscroll={onScroll}>
  {#if group}
    {#each rows as row (row.renderKey)}
      {#if row.type === 'group'}
        <div class={`${prefixCls}-group-section`} data-key={row.taggedKey}>
          <ListyGroupHeader {row} title={group.title} {prefixCls} {sticky}
            class={classNames.groupHeader} style={styles.groupHeader} />
          {#each row.children as item (item.renderKey)}{@render renderItem(item)}{/each}
        </div>
      {/if}
    {/each}
  {:else}
    {#each rows as row (row.renderKey)}
      {#if row.type === 'item'}{@render renderItem(row)}{/if}
    {/each}
  {/if}
</div>
