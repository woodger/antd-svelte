<script lang="ts">
  import { Pagination, type ComponentSize } from 'antd-svelte';

  export interface PaginationPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    wireframe?: boolean;
    disabled?: boolean;
    size?: ComponentSize;
    simple?: boolean;
    readonly?: boolean;
    changer?: boolean;
    quick?: boolean;
    align?: 'start' | 'center' | 'end';
  }
  let { sample, scope = 'normal', local = true }: {
    sample: PaginationPrefixSample;
    scope?: string;
    local?: boolean;
  } = $props();
  let current = $state(5);
  let pageSize = $state(10);
  let events = $state<string[]>([]);
</script>

<section data-pagination-prefix-scope={scope} style="padding:24px;width:740px">
  <Pagination prefixCls={local ? sample.local : undefined} total={500} bind:current bind:pageSize
    disabled={sample.disabled} size={sample.size} align={sample.align}
    simple={sample.readonly ? { readOnly: true } : sample.simple}
    showQuickJumper={sample.quick} showSizeChanger={sample.changer ?? false}
    class="fixture-pagination-prefix" onChange={(page, size) => events.push(`${page}:${size}`)} />
  <output aria-label="Pagination prefix values">{current}:{pageSize}</output>
  <output aria-label="Pagination prefix events">{JSON.stringify(events)}</output>
</section>
