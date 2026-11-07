<script lang="ts">
  import { ConfigProvider, Space, SpaceCompact, type SpaceProps } from 'antd-svelte';

  let { id, priority, prefix = 'ant', reversed = false }: {
    id: string;
    priority?: boolean;
    prefix?: string;
    reversed?: boolean;
  } = $props();
  const sizes: Record<string, SpaceProps['size']> = {
    small: 'small',
    medium: 'medium',
    large: 'large',
    tuple: ['small', 'large'],
    variable: 'small',
    numeric: [12, 24],
    zero: 0
  };
  let root = $state<HTMLDivElement>();
  let entries = $derived([
    { key: 'draft', children: draft },
    { key: 'probe', children: probe }
  ]);
  let ordered = $derived(reversed ? [...entries].reverse() : entries);
</script>

{#snippet draft()}<input aria-label={`Space themed draft ${id}`} value="Draft"
  style="font:inherit;width:100px" />{/snippet}
{#snippet probe()}<span data-space-alias style={`font-size:var(--${prefix}-font-size);padding:var(--${
  prefix}-padding-xs);color:var(--${prefix}-color-text)`}>Alias</span>{/snippet}

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'}>
  <div data-space-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
    style="font-size:21px;line-height:29px;color:rgb(31,41,51);display:block">
    {#if id === 'compact'}
      <SpaceCompact class="local-compact" items={ordered} />
    {:else}
      <Space bind:nativeElement={root} items={ordered} size={sizes[id]}
        vertical={id === 'vertical'} wrap separator="|" class="local-space"
        classNames={{ root: 'local-root', item: 'local-item', separator: 'local-separator' }}
        styles={priority ? {
          root: 'row-gap:27px;column-gap:29px;padding:7px',
          item: 'color:#135200',
          separator: 'color:#0958d9'
        } : undefined}
        style={[
          id === 'variable' && `--${prefix}-padding-xs:19px`,
          priority && 'row-gap:31px;column-gap:33px;padding:9px;flex-wrap:nowrap'
        ].filter(Boolean).join(';')} />
    {/if}
  </div>
</ConfigProvider>
<output aria-label={`Space theme ref ${id}`}>{root ? 'mounted' : 'empty'}</output>
