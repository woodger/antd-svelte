<script lang="ts">
  import { ConfigProvider, QRCode, type StatusRenderInfo } from 'antd-svelte';

  let { id, priority = false }: { id: string; priority?: boolean; } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let refreshes = $state(0);
</script>

{#snippet status(info: StatusRenderInfo)}
  <button type="button" style="font:inherit" onclick={info.onRefresh}>Custom refresh</button>
{/snippet}

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'}>
  <div data-qrcode-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
    style="width:240px;height:180px;font-size:14px;color:rgb(31,41,51)">
    <QRCode bind:nativeElement value="token-scopes" size={160} aria-label={`QRCode theme ${id}`}
      type={['canvas', 'borderless', 'explicit', 'custom', 'nested', 'sibling'].includes(id)
        ? 'canvas' : 'svg'}
      bordered={id !== 'borderless'} color={id === 'explicit' ? '#722ed1' : undefined}
      bgColor={id === 'explicit' ? '#fffbe6' : undefined}
      status={['expired', 'custom'].includes(id) ? 'expired'
        : id === 'loading' ? 'loading' : id === 'scanned' ? 'scanned' : 'active'}
      statusRender={id === 'custom' ? status : undefined}
      onRefresh={() => refreshes++}
      styles={priority ? { root: 'padding:7px;border-radius:11px',
        cover: 'background:#fff1f0;color:#873800' } : undefined}
      style={priority ? 'padding:9px;border-radius:3px' : undefined} />
  </div>
</ConfigProvider>
<output aria-label={`QRCode theme ref ${id}`}>{nativeElement ? 'mounted' : 'empty'}</output>
<output aria-label={`QRCode theme refresh ${id}`}>{refreshes}</output>
