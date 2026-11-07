<script lang="ts">
  import {
    ConfigProvider,
    Pagination,
    type PaginationProps,
    type PaginationComponentConfig,
    type PaginationItemInfo,
    type PaginationItemType,
    type PaginationSizeChangerInfo
  } from 'antd-svelte';
  import type { Snippet } from 'svelte';

  let current = $state(6);
  let pageSize = $state(10);
  let total = $state('200');
  let mode = $state('normal');
  let quick = $state('off');
  let less = $state(false);
  let jumpers = $state(true);
  let titles = $state(true);
  let align = $state<'start' | 'center' | 'end'>('start');
  let responsive = $state(false);
  let size = $state('inherit');
  let contextSize = $state('inherit');
  let changer = $state('auto');
  let threshold = $state('inherit');
  let optionOrder = $state(false);
  let customChanger = $state(false);
  let searchChanger = $state(true);
  let custom = $state(false);
  let customControl = $state(false);
  let customIcons = $state(false);
  let strict = $state(false);
  let accept = $state(true);
  let localDisabled = $state('inherit');
  let hide = $state(false);
  let mounted = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let semantics = $state(false);
  let customLocale = $state(false);
  let log = $state<string[]>([]);
  let context = $derived<PaginationComponentConfig | undefined>(semantics ? {
    class: 'pagination-context',
    style: 'padding:2px;color:red',
    styles: { root: 'padding:1px', item: 'color:red' },
    classNames: { root: 'context-root', item: 'context-page' },
    showSizeChanger: { showSearch: false },
    totalBoundaryShowSizeChanger: 25
  } : undefined);
  let props = $derived<PaginationProps>({
    total: Number(total),
    defaultCurrent: 3,
    defaultPageSize: 5,
    simple: mode === 'normal' ? false : mode === 'simple' ? true : { readOnly: true },
    showLessItems: less,
    showPrevNextJumpers: jumpers,
    showTitle: titles,
    showQuickJumper: quick === 'off' ? false : quick === 'blur' ? true
      : { goButton: quick === 'button' ? true : goLabel },
    align,
    responsive,
    size: size === 'inherit' ? undefined : size as 'small' | 'medium' | 'large',
    disabled: localDisabled === 'inherit' ? undefined : localDisabled === 'true',
    showSizeChanger: changer === 'auto' ? undefined : changer === 'yes' ? true
      : changer === 'no' ? false : {
        showSearch: searchChanger,
        size: 'small',
        onChange: value => log.push(`select:${value}`)
      },
    totalBoundaryShowSizeChanger: threshold === 'inherit' ? undefined : Number(threshold),
    pageSizeOptions: optionOrder ? [50, '10', 20] : [10, 20, 50, 100],
    hideOnSinglePage: hide,
    itemRender: custom ? item : undefined,
    components: customChanger ? { sizeChanger: sizeChanger } : undefined,
    prevIcon: customIcons ? '←' : undefined,
    nextIcon: customIcons ? '→' : undefined,
    jumpPrevIcon: customIcons ? '«' : undefined,
    jumpNextIcon: customIcons ? '»' : undefined,
    showTotal: totalNode,
    locale: customLocale ? {
      prev_page: 'Back one',
      next_page: 'Forward one',
      prev_3: 'Back three',
      next_3: 'Forward three',
      prev_5: 'Back five',
      next_5: 'Forward five',
      jump_to: 'Jump to',
      jump_to_confirm: 'Confirm page',
      page: 'pages',
      items_per_page: 'per batch',
      page_size: 'Batch size'
    } : undefined,
    class: 'pagination-features',
    rootClassName: semantics ? 'pagination-root-extra' : undefined,
    style: semantics ? 'padding:4px;color:green' : undefined,
    classNames: semantics ? ({ props }) => ({
      root: `local-size-${props.size ?? 'none'}`,
      item: 'local-page'
    }) : undefined,
    styles: semantics ? { root: 'padding:3px', item: 'color:blue' } : undefined,
    onChange: (page, size) => {
      log.push(`change:${page}:${size}`);
      if (strict && accept) {
        current = page;
        pageSize = size;
      }
    },
    onShowSizeChange: (page, size) => log.push(`size:${page}:${size}`),
    'aria-label': 'Extended pagination',
    'data-testid': 'pagination-root'
  });
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-block: 16px; }
  .controls label { display: inline-flex; align-items: center; gap: 4px; }
  output { display: block; }
</style>

<section id="pagination-features-fixture">
  <h2>Pagination source features</h2>
  <div class="controls">
    <label>Pagination total<input bind:value={total} /></label>
    <label>Owner page<input type="number" value={current}
      oninput={event => current = Number(event.currentTarget.value)} /></label>
    <label>Owner page size<input type="number" value={pageSize}
      oninput={event => pageSize = Number(event.currentTarget.value)} /></label>
    <label>Pager mode<select aria-label="Pager mode" bind:value={mode}>
      <option value="normal">Normal</option><option value="simple">Simple</option>
      <option value="readonly">Read only</option>
    </select></label>
    <label>Quick jumper<select aria-label="Quick jumper" bind:value={quick}>
      <option value="off">Off</option><option value="blur">Blur</option>
      <option value="button">Button</option><option value="custom">Custom label</option>
    </select></label>
    <label>Pagination alignment<select aria-label="Pagination alignment" bind:value={align}>
      <option value="start">Start</option><option value="center">Center</option>
      <option value="end">End</option>
    </select></label>
    <label>Pagination size<select aria-label="Pagination size" bind:value={size}>
      <option value="inherit">Inherit</option><option value="small">Small</option>
      <option value="medium">Middle</option><option value="large">Large</option>
    </select></label>
    <label>Context pagination size<select aria-label="Context pagination size" bind:value={contextSize}>
      <option value="inherit">Inherit</option><option value="small">Small</option>
      <option value="medium">Middle</option><option value="large">Large</option>
    </select></label>
    <label>Size changer<select aria-label="Size changer" bind:value={changer}>
      <option value="auto">Auto</option><option value="yes">Yes</option>
      <option value="no">No</option><option value="props">Select props</option>
    </select></label>
    <label>Size threshold<input bind:value={threshold} /></label>
    <label>Pagination disabled<select aria-label="Pagination disabled" bind:value={localDisabled}>
      <option value="inherit">Inherit</option><option value="false">False</option>
      <option value="true">True</option>
    </select></label>
    <label><input type="checkbox" bind:checked={less} /> Less page items</label>
    <label><input type="checkbox" bind:checked={jumpers} /> Page jump buttons</label>
    <label><input type="checkbox" bind:checked={titles} /> Pagination titles</label>
    <label><input type="checkbox" bind:checked={responsive} /> Responsive pager</label>
    <label><input type="checkbox" bind:checked={optionOrder} /> String size options</label>
    <label><input type="checkbox" bind:checked={customChanger} /> Custom size changer</label>
    <label><input type="checkbox" bind:checked={searchChanger} /> Search size options</label>
    <label><input type="checkbox" bind:checked={custom} /> Custom pager items</label>
    <label><input type="checkbox" bind:checked={customControl} /> Replace pager controls</label>
    <label><input type="checkbox" bind:checked={customIcons} /> Custom pager icons</label>
    <label><input type="checkbox" bind:checked={strict} /> Strict owner pager</label>
    <label><input type="checkbox" bind:checked={accept} /> Accept pager changes</label>
    <label><input type="checkbox" bind:checked={hide} /> Hide one-page pager</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount pager</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark pager</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact pager</label>
    <label><input type="checkbox" bind:checked={semantics} /> Pager semantics</label>
    <label><input type="checkbox" bind:checked={customLocale} /> Source locale aliases</label>
    <button type="button" onclick={() => log = []}>Clear pager events</button>
  </div>
  <ConfigProvider pagination={context} theme={{ mode: dark ? 'dark' : 'light', compact }}
    componentSize={contextSize === 'inherit' ? undefined : contextSize as 'small' | 'medium' | 'large'}
    style="background:var(--ant-color-bg-container);color:var(--ant-color-text)">
    <form onsubmit={event => event.preventDefault()}>
      {#if mounted}
        {#if strict}<Pagination {...props}
          bind:current={() => current, () => {}} bind:pageSize={() => pageSize, () => {}} />
        {:else}<Pagination {...props} bind:current bind:pageSize />{/if}
      {/if}
    </form>
  </ConfigProvider>
  <button type="button">Outside pager</button>
  <output aria-label="Pager owner">{current}:{pageSize}</output>
  <output aria-label="Pager events">{log.join('|')}</output>
</section>

{#snippet totalNode(total: number, range: [number, number])}
  <span aria-label="Pager range">{range.join('–')} / {total}</span>
{/snippet}

{#snippet item(page: number, type: PaginationItemType, original: Snippet, info: PaginationItemInfo)}
  {#if customControl}
    <button type="button" disabled={info.disabled} aria-label={`Custom ${info.label}`}
      aria-current={info.active ? 'page' : undefined} onclick={info.onClick}>
      {type}:{page}
    </button>
  {:else}<span data-testid={`render-${type}-${page}`} title={info.title}>
    {@render original()}
  </span>{/if}
{/snippet}

{#snippet sizeChanger(info: PaginationSizeChangerInfo)}
  <input type="number" value={info.value} disabled={info.disabled} class={info.class}
    aria-label="Custom page size" oninput={event => info.onChange(Number(event.currentTarget.value))} />
{/snippet}

{#snippet goLabel()}Go now{/snippet}
