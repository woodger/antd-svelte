<script lang="ts">
  import { Masonry } from 'antd-svelte';
  import type { MasonryItemType, MasonryProps } from 'antd-svelte';

  export interface MasonryPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    rtl?: boolean;
    local?: string;
    aliases?: boolean;
  }
  let { scope, sample, local = true, removeLast = false }: {
    scope: string;
    sample: MasonryPrefixSample;
    local?: boolean;
    removeLast?: boolean;
  } = $props();
  const items: MasonryItemType<{ height: number; }>[] = [70, 40, 90, 30, 55]
    .map((height, index) => ({ key: String(index), data: { height } }));
  let selected = $derived(removeLast ? items.slice(0, -1) : items);
  const classes: MasonryProps<{ height: number; }>['classNames'] = ({ props }) => {
    const value = props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty';
    return { root: `fixture-raw-prefix-${value}` };
  };
</script>

{#snippet renderItem({ index, data }: { index: number; data: { height: number; }; })}
  <div data-masonry-tile={String(index)} style={`height:${data.height}px`}>
    <input aria-label={`${scope} item ${index}`} value={`Draft ${index}`} />
  </div>
{/snippet}

<div data-masonry-prefix-scope={scope} style="width:360px">
  <Masonry prefixCls={local ? sample.local : undefined} items={selected}
    columns={3} gutter={[12, 18]} itemRender={renderItem} classNames={classes} />
</div>
