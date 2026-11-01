<script lang="ts">
  import {
    ConfigProvider,
    List,
    type ComponentSize,
    type ListConfig,
    type ListContent,
    type ListGridType,
    type ListItemMetaRef,
    type ListProps,
    type PaginationConfig,
    type RenderEmptyComponent,
    type SpinProps
  } from 'antd-svelte';
  import ListRecordFixture, { type ListRecordData } from './ListRecordFixture.svelte';

  const records: readonly ListRecordData[] = Object.freeze([
    { key: 0, label: 'Alpha' },
    { key: '', label: 'Beta' },
    { key: 2, label: 'Gamma' },
    { key: 3, label: 'Delta' },
    { key: 4, label: 'Epsilon' },
    { key: 5, label: 'Zeta' }
  ]);
  let dataMode = $state('normal');
  let reversed = $state(false);
  let paginationMode = $state('config');
  let position = $state<'top' | 'bottom' | 'both'>('bottom');
  let align = $state<'inherit' | 'start' | 'center' | 'end'>('inherit');
  let controlled = $state(false);
  let accept = $state(true);
  let ownerCurrent = $state(1);
  let ownerSize = $state(2);
  let defaultCurrent = $state(1);
  let defaultSize = $state(2);
  let layout = $state<'horizontal' | 'vertical'>('horizontal');
  let size = $state('inherit');
  let contextSize = $state('inherit');
  let bordered = $state(true);
  let split = $state(true);
  let gridMode = $state('off');
  let loadingMode = $state('off');
  let contentMode = $state('meta');
  let extraMode = $state('off');
  let actions = $state(true);
  let zeroMeta = $state(false);
  let headerMode = $state('text');
  let footerMode = $state('off');
  let loadMore = $state(false);
  let children = $state(false);
  let emptyMode = $state('inherit');
  let localeMode = $state('inherit');
  let semantic = $state(false);
  let localStyles = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let mounted = $state(true);
  let listElement = $state<HTMLDivElement>();
  let rowElement = $state<HTMLElement>();
  let metaElement = $state<HTMLDivElement>();
  let metaRef = $state<ListItemMetaRef>();
  let log = $state<string[]>([]);
  let emptyCalls = 0;
  let emptySnapshot = $state(0);
  let source = $derived(dataMode === 'empty' ? []
    : dataMode === 'remote' ? records.slice(4)
      : dataMode === 'duplicates' ? [records[0], { ...records[0], label: 'Alpha copy' }, records[1]]
        : reversed ? [...records].reverse() : records);
  let paging: PaginationConfig = $derived({
    defaultCurrent,
    defaultPageSize: defaultSize,
    current: dataMode === 'remote' ? 4 : controlled ? ownerCurrent : undefined,
    pageSize: dataMode === 'remote' ? 10 : controlled ? ownerSize : undefined,
    total: dataMode === 'remote' ? 100 : undefined,
    position,
    align: align === 'inherit' ? undefined : align,
    showSizeChanger: true,
    pageSizeOptions: [2, 3, 10],
    class: 'list-pager',
    onChange: (page, size) => {
      log.push(`change:${page}:${size}`);
      if (controlled && accept) {
        ownerCurrent = page;
        ownerSize = size;
      }
    },
    onShowSizeChange: (page, size) => log.push(`size:${page}:${size}`)
  });
  let pagination = $derived(paginationMode === 'off' ? false
    : paginationMode === 'null' ? null : paginationMode === 'true' ? true : paging);
  let grid: ListGridType | undefined = $derived(gridMode === 'off' ? undefined
    : gridMode === 'fixed' ? { gutter: 16, column: 2 }
      : gridMode === 'fallback' ? { gutter: 16, column: 2, sm: 3 }
        : { gutter: 16, column: 2, xs: 1, sm: 2, md: 3, lg: 4, xl: 3, xxl: 2, xxxl: 6 });
  let loading: boolean | SpinProps = $derived(loadingMode === 'off' ? false
    : loadingMode === 'boolean' ? true : loadingMode === 'default' ? {}
      : { spinning: true, description: 'Loading list', delay: loadingMode === 'delay' ? 250 : 0 });
  let extra: ListContent = $derived(extraMode === 'off' ? undefined
    : extraMode === 'zero' ? 0 : extraMode === 'picture' ? picture : 'Details');
  let context: ListConfig | undefined = $derived(semantic ? {
    class: 'context-list',
    style: 'padding:2px;color:red',
    item: {
      classNames: { actions: 'context-actions', extra: 'context-extra' },
      styles: { actions: 'color:green', extra: 'color:pink' }
    }
  } : undefined);
  let header = $derived(headerMode === 'off' ? undefined
    : headerMode === 'zero' ? 0 : headerMode === 'true' ? true : 'List header');
  let footer = $derived(footerMode === 'off' ? undefined
    : footerMode === 'zero' ? 0 : footerMode === 'true' ? true : 'List footer');
  let locale = $derived(localeMode === 'inherit' ? undefined : {
    emptyText: localeMode === 'zero' ? 0 : localeMode === 'true' ? true : 'Local empty'
  });

  function renderEmpty(name?: RenderEmptyComponent): ListContent {
    emptyCalls++;
    if (emptyMode === 'zero') return 0;
    if (emptyMode === 'false') return false;
    if (emptyMode === 'snippet') return empty;
    return `Global empty ${name}`;
  }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-block: 16px; }
  label { display: inline-flex; align-items: center; gap: 4px; }
  input[type='number'] { width: 55px; }
  output { display: block; }
</style>

<section id="list-fixture">
  <h2>List</h2>
  <div class="controls">
    <label>List data<select bind:value={dataMode}>
      <option value="normal">Normal</option><option value="empty">Empty</option>
      <option value="remote">Server page</option><option value="no-render">No renderer</option>
      <option value="duplicates">Duplicate keys</option>
    </select></label>
    <label>List pagination<select bind:value={paginationMode}>
      <option value="config">Config</option><option value="off">Off</option>
      <option value="null">Null</option><option value="true">True</option>
    </select></label>
    <label>List page position<select bind:value={position}>
      <option value="top">Top</option><option value="bottom">Bottom</option>
      <option value="both">Both</option>
    </select></label>
    <label>List page align<select bind:value={align}>
      <option value="inherit">Default</option><option value="start">Start</option>
      <option value="center">Center</option><option value="end">End</option>
    </select></label>
    <label>List owner page<input type="number" bind:value={ownerCurrent} /></label>
    <label>List owner size<input type="number" bind:value={ownerSize} /></label>
    <label>List default page<input type="number" bind:value={defaultCurrent} /></label>
    <label>List default size<input type="number" bind:value={defaultSize} /></label>
    <label>List layout<select bind:value={layout}>
      <option value="horizontal">Horizontal</option><option value="vertical">Vertical</option>
    </select></label>
    <label>List size<select bind:value={size}>
      <option value="inherit">Inherit</option><option value="default">Default</option>
      <option value="small">Small</option><option value="large">Large</option>
    </select></label>
    <label>List context size<select bind:value={contextSize}>
      <option value="inherit">Inherit</option><option value="middle">Middle</option>
      <option value="small">Small</option><option value="large">Large</option>
    </select></label>
    <label>List grid<select bind:value={gridMode}>
      <option value="off">Off</option><option value="fixed">Fixed</option>
      <option value="responsive">Responsive</option><option value="fallback">Largest breakpoint</option>
    </select></label>
    <label>List loading<select bind:value={loadingMode}>
      <option value="off">Off</option><option value="boolean">Boolean</option>
      <option value="object">Object</option><option value="default">Default object</option>
      <option value="delay">Delay</option>
    </select></label>
    <label>List children mode<select bind:value={contentMode}>
      <option value="meta">Meta</option><option value="mixed">Mixed snippet</option>
      <option value="array">Mixed array</option><option value="numeric">Numeric array</option>
      <option value="single">Single text</option>
    </select></label>
    <label>List extra<select bind:value={extraMode}>
      <option value="off">Off</option><option value="text">Text</option>
      <option value="zero">Zero</option><option value="picture">Picture</option>
    </select></label>
    <label>List header<select bind:value={headerMode}>
      <option value="off">Off</option><option value="text">Text</option>
      <option value="zero">Zero</option><option value="true">True</option>
    </select></label>
    <label>List footer<select bind:value={footerMode}>
      <option value="off">Off</option><option value="text">Text</option>
      <option value="zero">Zero</option><option value="true">True</option>
    </select></label>
    <label>List global empty<select bind:value={emptyMode}>
      <option value="inherit">Default</option><option value="text">Text</option>
      <option value="snippet">Snippet</option><option value="zero">Zero</option>
      <option value="false">False</option>
    </select></label>
    <label>List locale empty<select bind:value={localeMode}>
      <option value="inherit">Inherit</option><option value="text">Text</option>
      <option value="zero">Zero</option><option value="true">True</option>
    </select></label>
    <label><input type="checkbox" bind:checked={controlled} /> Controlled list paging</label>
    <label><input type="checkbox" bind:checked={accept} /> Accept list pages</label>
    <label><input type="checkbox" bind:checked={bordered} /> Bordered list</label>
    <label><input type="checkbox" bind:checked={split} /> Split list</label>
    <label><input type="checkbox" bind:checked={actions} /> List actions</label>
    <label><input type="checkbox" bind:checked={zeroMeta} /> Zero Meta</label>
    <label><input type="checkbox" bind:checked={loadMore} /> List load more</label>
    <label><input type="checkbox" bind:checked={children} /> List appended children</label>
    <label><input type="checkbox" bind:checked={semantic} /> List semantics</label>
    <label><input type="checkbox" bind:checked={localStyles} /> List local styles</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark list</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact list</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount list</label>
    <button type="button" onclick={() => reversed = !reversed}>Reverse list</button>
    <button type="button" onclick={() => log = []}>Clear list events</button>
    <button type="button" onclick={() => emptySnapshot = emptyCalls}>Read empty calls</button>
  </div>
  <ConfigProvider list={context} theme={{ mode: dark ? 'dark' : 'light', compact }}
    style="background:var(--ant-color-bg-container);color:var(--ant-color-text)"
    componentSize={contextSize === 'inherit' ? undefined : contextSize as ComponentSize}
    renderEmpty={emptyMode === 'inherit' ? undefined : renderEmpty}>
    {#if mounted}
      <List dataSource={source} {pagination} {grid} {loading} {bordered} {split}
        itemLayout={layout} size={size === 'inherit' ? undefined : size as ListProps['size']}
        {header} {footer} {locale} loadMore={loadMore ? more : undefined}
        children={children ? appended : undefined}
        renderItem={dataMode === 'no-render' ? undefined : row}
        style={semantic ? 'padding:4px;color:green' : undefined}
        class="fixture-list" rootClassName="fixture-list-root" id="list-under-test"
        bind:nativeElement={listElement} />
    {/if}
  </ConfigProvider>
  <output aria-label="List events">{log.join('|')}</output>
  <output aria-label="List owner">{ownerCurrent}:{ownerSize}</output>
  <output aria-label="List refs" data-column={rowElement?.classList.contains('ant-col') ?? false}>{listElement?.tagName ?? 'none'}:{rowElement?.tagName ?? 'none'}:{metaElement?.tagName ?? 'none'}:{metaRef?.nativeElement === metaElement && metaElement ? 'same' : 'none'}</output>
  <output aria-label="Empty calls">{emptySnapshot}</output>
</section>

{#snippet row(record: ListRecordData, index: number)}
  {#if record === records[0]}
    <ListRecordFixture {record} {index} mode={contentMode} {extra} {actions} {semantic}
      {localStyles} zero={zeroMeta} bind:nativeElement={rowElement}
      bind:metaNativeElement={metaElement} bind:metaRef />
  {:else}
    <ListRecordFixture {record} {index} mode={contentMode} {extra} {actions} {semantic}
      {localStyles} zero={zeroMeta} />
  {/if}
{/snippet}
{#snippet picture()}<svg width="80" height="60" role="img" aria-label="List extra picture"><rect width="80" height="60" fill="teal" /></svg>{/snippet}
{#snippet more()}<button type="button">Load more records</button>{/snippet}
{#snippet appended()}<p data-testid="list-appended">Appended content</p>{/snippet}
{#snippet empty()}<strong>Snippet empty</strong>{/snippet}
