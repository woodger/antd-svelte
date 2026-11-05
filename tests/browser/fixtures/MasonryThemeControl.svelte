<script lang="ts">
  import { ConfigProvider, Masonry, type MasonryItemType } from 'antd-svelte';

  let { id, priority, prefix = 'ant', reversed = false, removed = false }: {
    id: string;
    priority?: boolean;
    prefix?: string;
    reversed?: boolean;
    removed?: boolean;
  } = $props();
  const base: MasonryItemType<{ lines: number }>[] = [2, 3, 1, 4].map((lines, index) => ({
    key: 'abcd'[index],
    data: { lines }
  }));
  let items = $derived((reversed ? [...base].reverse() : base)
    .filter(item => !removed || item.key !== 'b'));
  let root = $state<HTMLDivElement>();
  let notifications = $state<(string | number)[][]>([]);
</script>

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'} masonry={priority ? {
  styles: { root: 'font-size:26px', item: 'padding:2px' },
  style: 'font-size:28px'
} : undefined}>
  <div data-masonry-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
    style="width:600px;font-size:14px;line-height:22px;color:rgb(31,41,51)">
    <Masonry {items} columns={id === 'two' ? 2 : 3} gutter={[12, 8]} fresh={id !== 'stale'}
      bind:nativeElement={root}
      styles={priority ? { root: 'font-size:30px', item: 'top:999px;width:1px' } : undefined}
      style={[
        'width:600px',
        id === 'variable' && `--${prefix}-font-size:35px`,
        priority && 'font-size:32px'
      ].filter(Boolean).join(';')}
      onLayoutChange={items => notifications = [...notifications, items.map(item => item.column)]}>
      {#snippet itemRender({ key, data, column })}
        <div data-key={key} data-column={column} style={`height:${data.lines}em`}><span
          data-masonry-alias style={`color:var(--${prefix}-color-text)`}>Tile {key}</span><input
          aria-label={`Masonry theme draft ${id} ${key}`} value="Draft"
          style="font:inherit;width:90px" /></div>
      {/snippet}
    </Masonry>
  </div>
</ConfigProvider>
<output aria-label={`Masonry theme notifications ${id}`}>{JSON.stringify(notifications)}</output>
<output aria-label={`Masonry theme ref ${id}`}>{root ? 'mounted' : 'empty'}</output>
