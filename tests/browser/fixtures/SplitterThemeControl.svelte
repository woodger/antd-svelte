<script lang="ts">
  import { ConfigProvider, Splitter } from 'antd-svelte';

  let { id, priority = false }: { id: string; priority?: boolean; } = $props();
  let draft = $state('Draft');
  let events = $state<{ event: string; sizes: number[]; }[]>([]);
  let nativeElement = $state<HTMLDivElement>();
  let height = $derived(id === 'vertical' ? 240 : 160);
</script>

{#snippet content()}
  <input aria-label={`Splitter theme draft ${id}`} bind:value={draft}
    style="font:inherit;border:0;padding:0" />
{/snippet}
{#snippet icon()}<span>drag</span>{/snippet}

<div data-splitter-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
  style={`width:480px;height:${height}px;color:rgb(31,41,51)`}>
  <ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'}>
    <Splitter bind:nativeElement orientation={id === 'vertical' ? 'vertical' : 'horizontal'}
      lazy={id === 'lazy'} draggerIcon={id === 'custom' ? icon : undefined}
      items={[
        { defaultSize: '40%', min: '10%', max: '80%', resizable: id !== 'disabled',
          collapsible: { showCollapsibleIcon: true }, children: content,
          style: priority ? 'color:#722ed1' : undefined },
        { collapsible: { showCollapsibleIcon: true }, children: 'Second' }
      ]}
      style={`width:480px;height:${height}px;${priority ? '--ant-splitter-split-bar-size:5px' : ''}`}
      styles={priority ? { root: '--ant-splitter-split-bar-size:3px;background:#fff7e6',
        panel: 'background:#e6f4ff',
        dragger: { default: 'width:17px;height:41px;background:#fffbe6' } } : undefined}
      onResizeStart={sizes => events = [...events, { event: 'start', sizes }]}
      onResize={sizes => events = [...events, { event: 'resize', sizes }]}
      onResizeEnd={sizes => events = [...events, { event: 'end', sizes }]} />
  </ConfigProvider>
</div>
{#if id === 'normal'}
  <output aria-label="Splitter theme events">{JSON.stringify(events)}</output>
  <output aria-label="Splitter theme ref">{nativeElement ? 'mounted' : 'empty'}</output>
{/if}
