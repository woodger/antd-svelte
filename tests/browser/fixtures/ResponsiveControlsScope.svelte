<script module lang="ts">
  import type { ThemeConfig } from 'antd-svelte';

  export interface ResponsiveControlsSample {
    id: string;
    token?: ThemeConfig['token'];
    aliases?: boolean;
    size?: 'large';
    responsive?: boolean;
  }
</script>

<script lang="ts">
  import { Masonry, Pagination, type MasonryItemType } from 'antd-svelte';

  let { sample, kind }: { sample: ResponsiveControlsSample; kind?: 'masonry' | 'pagination' } = $props();
  const items: MasonryItemType<{ height: number }>[] = [70, 40, 90, 30, 55]
    .map((height, index) => ({ key: String(index), data: { height } }));
  let masonryElement = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
</script>

{#snippet tile({ data, index }: { data: { height: number }; index: number })}
  <div style={`height:${data.height}px`}><input aria-label={`Responsive masonry ${index}`}
    name={`draft-${index}`} value={`Draft ${index}`} style="width:60px" /></div>
{/snippet}
<form aria-label="Responsive controls form">
  {#if kind !== 'pagination'}<section data-responsive-masonry style="width:360px">
    <Masonry {items} columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
      gutter={[{ xs: 0, sm: 12, md: 18, lg: 24 }, { xs: 4, sm: 8, md: 12, lg: 16 }]}
      itemRender={tile} bind:nativeElement={masonryElement} />
  </section>{/if}
  {#if kind !== 'masonry'}<Pagination class="fixture-responsive-pagination" responsive={sample.responsive !== false}
    size={sample.size} defaultCurrent={4} total={100} showQuickJumper showSizeChanger={false}
    onChange={page => events.push(String(page))} />{/if}
</form>
<output aria-label="Responsive Masonry ref">{Boolean(masonryElement)}</output>
<output aria-label="Responsive Pagination events">{events.join('|')}</output>
