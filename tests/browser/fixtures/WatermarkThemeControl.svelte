<script lang="ts">
  import { Watermark, Modal, Drawer, type WatermarkContent } from 'antd-svelte';

  let { id }: { id: string; } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let modal = $state(false);
  let drawer = $state(false);
  let removed = $state(0);
  let content = $derived<WatermarkContent | WatermarkContent[]>(id === 'lines' ? [
    `${id}:Inherited`,
    { text: `${id}:Explicit`, font: { fontSize: 12, color: '#389e0d', fontStyle: 'italic' } },
    { text: `${id}:Undefined`, font: { fontSize: undefined, color: undefined } }
  ] : `${id}:Text`);
</script>

<div data-watermark-theme={id}>
  <Watermark class="theme-watermark" {content} bind:nativeElement onRemove={() => removed++}
    zIndex={id === 'explicit' ? 77 : undefined}
    font={id === 'explicit' ? {
      color: '#c41d7f', fontSize: 20, fontFamily: 'serif', fontWeight: 700, textAlign: 'left'
    } : undefined}
    style={`width:320px;height:120px;${id === 'css' ? '--ant-color-fill:#ff0000;--ant-font-size-lg:50px;--ant-z-index-popup-base:6000' : ''}`}>
    <input aria-label={`Watermark theme draft ${id}`} name={`watermark-${id}`} value="Draft" />
    {#if id === 'normal'}
      <button type="button" onclick={() => modal = true}>Open themed Watermark modal</button>
      <button type="button" onclick={() => drawer = true}>Open themed Watermark drawer</button>
      <Modal bind:open={modal} title="Watermark themed modal">
        <input aria-label="Watermark modal draft" value="Modal draft" />
      </Modal>
      <Drawer bind:open={drawer} title="Watermark themed drawer">
        <input aria-label="Watermark drawer draft" value="Drawer draft" />
      </Drawer>
    {/if}
  </Watermark>
  <output aria-label={`Watermark theme ref ${id}`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`Watermark theme removals ${id}`}>{removed}</output>
</div>
