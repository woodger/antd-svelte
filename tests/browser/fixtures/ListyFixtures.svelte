<script lang="ts">
  import {
    ConfigProvider,
    Listy,
    type ListyRef,
    type ListyScrollAlign,
    type ListyScrollToConfig
  } from 'antd-svelte';

  let mode = $state('raw');
  let contextVirtual = $state(false);
  let grouped = $state(false);
  let sticky = $state(false);
  let variable = $state(false);
  let mounted = $state(true);
  let compact = $state(false);
  let dark = $state(false);
  let semantic = $state(false);
  let special = $state(false);
  let nested = $state(false);
  let hidden = $state(false);
  let count = $state(20);
  let height = $state('200');
  let align = $state<ListyScrollAlign>('top');
  let offset = $state(0);
  let key = $state('row-010');
  let position = $state(400);
  let ref = $state<ListyRef>();
  let native = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
  let reversed = $state(false);
  let added = $state(0);
  let clicks = $state(0);
  const source = Array.from({ length: 2000 }, (_, index) => ({
    id: `row-${String(index).padStart(3, '0')}`,
    group: index % 4,
    index
  }));
  let items = $derived.by(() => {
    const data = source.slice(0, count + added).map((item, index) => ({
      ...item,
      id: special && index === 0 ? 0 : special && index === 1 ? ''
        : special && index === 2 ? 'a:"b]\\c' : item.id
    }));
    return reversed ? data.reverse() : data;
  });

  function scrollTo(config?: ListyScrollToConfig) { ref?.scrollTo(config); }

  function scrollBoth() {
    // Оба ключа допустимы structural typing; приоритет намеренно различается между режимами.
    const config = { key, groupKey: 2, align, offset };
    scrollTo(config);
  }

  function report(event: UIEvent & { currentTarget: HTMLDivElement; }) {
    events = [...events.slice(-9), `${event.currentTarget.className}:${event.currentTarget.scrollTop}`];
  }
</script>

<style>
  .surface { background: var(--ant-color-bg-container); }
  .controls { display: flex; gap: 12px; flex-wrap: wrap; }
  .controls label { display: block; }
  .row { display: flex; justify-content: space-between; align-items: center; }
  .tail { height: 400px; }
</style>

{#snippet title(groupKey: number, entries: typeof items)}
  <strong data-group={groupKey}>Group {groupKey} ({entries.length})</strong>
{/snippet}
{#snippet itemRender(item: typeof items[number], index: number)}
  <div class="row" style={variable ? `height:${20 + item.index % 3 * 30}px` : undefined}
    data-record={String(item.id)} data-source-index={index}>
    <a href={`#record-${item.index}`}>Record {String(item.id)}</a>
    <button type="button" onclick={() => { clicks++; }}>Action {String(item.id)}</button>
  </div>
  {#if nested && item.index === 0}
    <Listy id="nested-listy" items={source.slice(0, 20)} rowKey="id" height={100} virtual>
      {#snippet itemRender(entry)}<span>Nested {entry.id}</span>{/snippet}
    </Listy>
  {/if}
{/snippet}

<section id="listy-fixture">
  <div class="controls">
    <label>Listy mode <select bind:value={mode}>
      <option value="raw">raw</option><option value="virtual">virtual</option>
      <option value="inherit">inherit</option>
    </select></label>
    <label><input type="checkbox" bind:checked={contextVirtual} /> Listy context virtual</label>
    <label><input type="checkbox" bind:checked={grouped} /> Listy groups</label>
    <label><input type="checkbox" bind:checked={sticky} /> Listy sticky</label>
    <label><input type="checkbox" bind:checked={variable} /> Listy variable heights</label>
    <label><input type="checkbox" bind:checked={semantic} /> Listy semantic styles</label>
    <label><input type="checkbox" bind:checked={special} /> Listy special keys</label>
    <label><input type="checkbox" bind:checked={nested} /> Listy nested</label>
    <label><input type="checkbox" bind:checked={hidden} /> Listy hidden</label>
    <label><input type="checkbox" bind:checked={compact} /> Listy compact</label>
    <label><input type="checkbox" bind:checked={dark} /> Listy dark</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount Listy</label>
    <label>Listy count <select bind:value={count}>
      <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option>
      <option value={20}>20</option><option value={2000}>2000</option>
    </select></label>
    <label>Listy height <select bind:value={height}>
      <option value="200">200</option><option value="100">100</option>
      <option value="200.5">200.5</option>
      <option value="300">300</option><option value="0">0</option><option value="none">none</option>
    </select></label>
    <label>Listy align <select bind:value={align}>
      <option value="top">top</option><option value="bottom">bottom</option>
      <option value="auto">auto</option>
    </select></label>
    <label>Listy offset <input type="number" bind:value={offset} /></label>
    <label>Listy target key <input bind:value={key} /></label>
    <label>Listy position <input type="number" bind:value={position} /></label>
  </div>
  <button type="button" onclick={() => scrollTo({ key, align, offset })}>Scroll Listy item</button>
  <button type="button" onclick={() => scrollTo({ groupKey: 2, align, offset })}>Scroll Listy group</button>
  <button type="button" onclick={scrollBoth}>Scroll Listy both keys</button>
  <button type="button" onclick={() => scrollTo(position)}>Scroll Listy number</button>
  <button type="button" onclick={() => scrollTo({ top: position, left: 20 })}>Scroll Listy position</button>
  <button type="button" onclick={() => scrollTo()}>Flash Listy scrollbar</button>
  <button type="button" onclick={() => scrollTo(null)}>Scroll Listy null</button>
  <button type="button" onclick={() => { reversed = !reversed; }}>Reverse Listy records</button>
  <button type="button" onclick={() => { added += 2; }}>Append Listy records</button>
  <button type="button" onclick={() => {
    scrollTo({ key: 'row-020', align: 'top' });
    added = 2;
  }}>Scroll Listy arriving record</button>
  <button type="button" onclick={() => {
    scrollTo({ key: 'row-015', align: 'top' });
    scrollTo({ key: 'row-006', align: 'top' });
  }}>Scroll Listy latest request</button>
  <button type="button" onclick={() => { events = []; }}>Clear Listy events</button>
  <output aria-label="Listy refs">{ref ? Object.keys(ref).join(',') : 'none'}:{native?.tagName ?? 'none'}</output>
  <output aria-label="Listy events">{events.join('|')}</output>
  <output aria-label="Listy actions">{clicks}</output>
  <ConfigProvider virtual={contextVirtual} theme={{ mode: dark ? 'dark' : 'light', compact }}
    listy={semantic ? {
      class: 'provider-listy',
      classNames: ({ props }) => ({ root: `provider-height-${props.height}`, item: 'provider-item',
        groupHeader: 'provider-header' }),
      style: 'color:rgb(80,0,0)',
      styles: { root: 'border:1px solid red', item: 'padding-block:5px', groupHeader: 'top:99px' }
    } : undefined}>
    <div class="surface">
      {#if mounted}
        <Listy id="listy-under-test" {items} rowKey="id" {itemRender}
          group={grouped ? { key: item => item.group, title } : undefined} {sticky}
          virtual={mode === 'inherit' ? undefined : mode === 'virtual'}
          height={height === 'none' ? undefined : Number(height)}
          onScroll={report} bind:ref bind:nativeElement={native}
          class="local-listy" rootClassName="root-listy" aria-label="Records"
          classNames={semantic ? { item: 'local-item', groupHeader: 'local-header' } : undefined}
          styles={semantic ? { root: 'position:static', item: 'padding-block:7px' } : undefined}
          style={[semantic && 'color:rgb(0,0,90)', hidden && 'visibility:hidden']
            .filter(Boolean).join(';') || undefined} />
      {/if}
    </div>
  </ConfigProvider>
  <div class="tail"></div>
</section>
