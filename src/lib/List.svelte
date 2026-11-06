<script lang="ts" generics="T = unknown">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { provideList } from './list-context';
  import { createBreakpoint } from './grid-breakpoint.model.svelte.js';
  import { gridBreakpoints } from './grid.engine';
  import {
    listGridColumn,
    listHasContent,
    listPageData,
    listPagination,
    listPaginationDefaults,
    listRows
  } from './list.engine';
  import type { ListProps } from './list.types';
  import ListContent from './RenderContent.svelte';
  import Empty from './Empty.svelte';
  import Pagination from './Pagination.svelte';
  import Row from './Row.svelte';
  import Spin from './Spin.svelte';

  let {
    bordered = false,
    split = true,
    dataSource = [],
    renderItem,
    rowKey,
    children,
    header,
    footer,
    loadMore,
    grid,
    itemLayout,
    loading = false,
    pagination = false,
    size,
    locale,
    prefixCls = 'ant-list',
    class: className,
    rootClassName,
    style,
    nativeElement = $bindable(),
    ...attributes
  }: ListProps<T> = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('List');
  const initial = untrack(() => listPaginationDefaults(pagination));
  const breakpoint = createBreakpoint();
  let current = $state(initial.current);
  let pageSize = $state(initial.pageSize);
  let paginationProps = $derived(listPagination(dataSource.length, pagination, current, pageSize));
  let data = $derived(listPageData(dataSource, paginationProps, Boolean(pagination)));
  let rows = $derived(renderItem ? listRows(data, rowKey) : []);
  let loadingProps = $derived(typeof loading === 'boolean' ? { spinning: loading } : loading);
  let isLoading = $derived(Boolean(loadingProps?.spinning));
  let resolvedSize = $derived(size ?? config.componentSize);
  let column = $derived(grid ? listGridColumn(grid, breakpoint.screens) : undefined);
  let colStyle = $derived(column ? `width:${100 / column}%;max-width:${100 / column}%` : undefined);
  let afterLastItem = $derived(Boolean(loadMore || pagination || listHasContent(footer)));
  // extra есть в типах upstream, но отдельного блока у корневого List нет.
  let forwarded = $derived(Object.fromEntries(
    Object.entries(attributes).filter(([name]) => name !== 'extra')
  ));

  provideList({
    get grid() { return grid; },
    get itemLayout() { return itemLayout; }
  });

  $effect(() => {
    const value = grid;
    if (value && gridBreakpoints.some(key => Object.hasOwn(value, key))) {
      return breakpoint.connect(window);
    }
  });

  function changePagination(event: 'onChange' | 'onShowSizeChange', page: number, size: number) {
    current = page;
    pageSize = size;
    if (pagination && typeof pagination === 'object') pagination[event]?.(page, size);
  }
</script>

<style>
  .ant-list :global(:focus-visible) { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .ant-list :global(a) { transition: none; } }
</style>

{#snippet pager()}
  {#if pagination}
    <div class={`${prefixCls}-pagination`}>
      <Pagination {...paginationProps} align={paginationProps.align ?? 'end'}
        bind:current={() => paginationProps.current, () => {}}
        bind:pageSize={() => paginationProps.pageSize, () => {}}
        onChange={(page, size) => changePagination('onChange', page, size)}
        onShowSizeChange={(page, size) => changePagination('onShowSizeChange', page, size)} />
    </div>
  {/if}
{/snippet}

<div {...forwarded} bind:this={nativeElement} dir={config.direction}
  class={[
    prefixCls,
    'ant-list-css-var',
    componentTheme.className,
    itemLayout === 'vertical' && `${prefixCls}-vertical`,
    resolvedSize === 'small' && `${prefixCls}-sm`,
    resolvedSize === 'large' && `${prefixCls}-lg`,
    split && `${prefixCls}-split`,
    bordered && `${prefixCls}-bordered`,
    isLoading && `${prefixCls}-loading`,
    grid && `${prefixCls}-grid`,
    afterLastItem && `${prefixCls}-something-after-last-item`,
    config.direction === 'rtl' && `${prefixCls}-rtl`,
    config.list?.class,
    className,
    rootClassName
  ]} style={[componentTheme.style, config.list?.style, style].filter(Boolean).join(';')}>
  {#if paginationProps.position === 'top' || paginationProps.position === 'both'}
    {@render pager()}
  {/if}
  {#if listHasContent(header)}
    <div class={`${prefixCls}-header`}><ListContent value={header} /></div>
  {/if}
  <Spin {...loadingProps}>
    {#if data.length > 0}
      {#if grid}
        <Row class={[`${prefixCls}-container ant-list-css-var`, componentTheme.className]
          .filter(Boolean).join(' ')} style={componentTheme.style} gutter={grid.gutter}>
          {#each rows as row (row.key)}
            <div style={colStyle}>{@render renderItem?.(row.item, row.index)}</div>
          {/each}
        </Row>
      {:else}
        <ul class={[`${prefixCls}-items ${prefixCls}-container ant-list-css-var`,
          componentTheme.className]} style={componentTheme.style}>
          {#each rows as row (row.key)}{@render renderItem?.(row.item, row.index)}{/each}
        </ul>
      {/if}
    {:else if isLoading}<div style="min-height:53px"></div>
    {:else if !children}
      {@const empty = locale?.emptyText || config.renderEmpty?.('List')}
      <div class={`${prefixCls}-empty-text`}>
        {#if empty}<ListContent value={empty} />{:else}<Empty image="simple" />{/if}
      </div>
    {/if}
    <ListContent value={children} />
  </Spin>
  {#if listHasContent(footer)}
    <div class={`${prefixCls}-footer`}><ListContent value={footer} /></div>
  {/if}
  {#if loadMore}<ListContent value={loadMore} />
  {:else if paginationProps.position === 'bottom' || paginationProps.position === 'both'}
    {@render pager()}
  {/if}
</div>
