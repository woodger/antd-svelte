<script lang="ts">
  import { ConfigProvider, QRCode, type QRStatus, type StatusRenderInfo } from 'antd-svelte';

  const iconData = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><rect width="20" height="10" fill="red"/></svg>'
  );
  let type = $state<'canvas' | 'svg'>('canvas');
  let payload = $state('text');
  let status = $state<QRStatus>('active');
  let size = $state(160);
  let level = $state<'L' | 'M' | 'Q' | 'H'>('M');
  let boost = $state(true);
  let margin = $state(0);
  let bordered = $state(true);
  let icon = $state('none');
  let iconKey = $state(1);
  let rectangular = $state(false);
  let zeroIcon = $state(false);
  let customColor = $state(false);
  let opaque = $state(false);
  let dark = $state(false);
  let styled = $state(false);
  let dimensions = $state(false);
  let customStatus = $state(false);
  let emptyStatus = $state(false);
  let refresh = $state(true);
  let nested = $state(false);
  let translated = $state(false);
  let mounted = $state(true);
  let nativeElement = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
  let value = $derived(payload === 'segments'
    ? ['1234567890'.repeat(12), 'hello', '1234567890'.repeat(12)]
    : payload === 'joined' ? '1234567890'.repeat(12) + 'hello' + '1234567890'.repeat(12)
      : payload === 'unicode' ? 'Привет, 世界 😀 Svelte 5'
        : payload === 'long' ? 'a'.repeat(1000)
          : payload === 'empty' ? '' : payload === 'empty-array' ? [] : 'Ant Design');
  let src = $derived(icon === 'data' ? iconData
    : icon === 'remote' ? `http://qrcode.test/icon.svg?key=${iconKey}`
      : icon === 'broken' ? 'data:image/png;base64,YWJj' : undefined);
  let iconSize = $derived(zeroIcon ? 0 : rectangular ? { width: 20, height: 40 } : 40);
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .drawing-holder { width: 320px; height: 240px; }
  .reference { margin-block: 12px; }
</style>

{#snippet replacement(info: StatusRenderInfo)}
  <div class="custom-qr-status" data-status={info.status}>
    {info.locale.scanned}
    {#if info.onRefresh}<button type="button" onclick={info.onRefresh}>Custom QR refresh</button>{/if}
  </div>
{/snippet}
{#snippet noStatus()}{/snippet}

<section id="qrcode-fixture">
  <h2>QRCode</h2>
  <div class="controls">
    <label>QRCode renderer<select bind:value={type}>
      <option value="canvas">QR canvas</option><option value="svg">QR SVG</option>
    </select></label>
    <label>QRCode payload<select bind:value={payload}>
      <option value="text">QR text</option><option value="segments">QR segments</option>
      <option value="joined">QR joined segments</option><option value="unicode">QR Unicode</option>
      <option value="long">QR long payload</option><option value="empty">QR empty string</option>
      <option value="empty-array">QR empty array</option>
    </select></label>
    <label>QRCode status<select bind:value={status}>
      <option value="active">QR active</option><option value="expired">QR expired</option>
      <option value="loading">QR loading</option><option value="scanned">QR scanned</option>
    </select></label>
    <label>QRCode error level<select bind:value={level}>
      <option value="L">QR L</option><option value="M">QR M</option>
      <option value="Q">QR Q</option><option value="H">QR H</option>
    </select></label>
    <label>QRCode icon<select bind:value={icon}>
      <option value="none">QR no icon</option><option value="data">QR data icon</option>
      <option value="remote">QR delayed icon</option><option value="broken">QR broken icon</option>
    </select></label>
    <label>QRCode size<input type="number" bind:value={size} /></label>
    <label>QRCode margin<input type="number" bind:value={margin} /></label>
    <label><input type="checkbox" bind:checked={boost} /> Boost QRCode</label>
    <label><input type="checkbox" bind:checked={bordered} /> Bordered QRCode</label>
    <label><input type="checkbox" bind:checked={rectangular} /> Rectangular QRCode icon</label>
    <label><input type="checkbox" bind:checked={zeroIcon} /> Zero QRCode icon size</label>
    <label><input type="checkbox" bind:checked={customColor} /> Custom QRCode color</label>
    <label><input type="checkbox" bind:checked={opaque} /> Opaque QRCode background</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark QRCode</label>
    <label><input type="checkbox" bind:checked={styled} /> Styled QRCode</label>
    <label><input type="checkbox" bind:checked={dimensions} /> Plain QRCode dimensions</label>
    <label><input type="checkbox" bind:checked={customStatus} /> Custom QRCode status</label>
    <label><input type="checkbox" bind:checked={emptyStatus} /> Empty QRCode status</label>
    <label><input type="checkbox" bind:checked={refresh} /> Refresh QRCode action</label>
    <label><input type="checkbox" bind:checked={nested} /> Replace QRCode config</label>
    <label><input type="checkbox" bind:checked={translated} /> Partial QRCode locale</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount QRCode</label>
    <button type="button" onclick={() => { iconKey++; }}>Change QRCode icon</button>
  </div>
  <ConfigProvider
    theme={{ mode: dark ? 'dark' : 'light', primary: 'purple' }}
    qrcode={{
      class: 'qrcode-context',
      style: 'outline-offset:4px;width:999px;height:999px',
      classNames: ({ props }) => ({ root: `context-${props.type}`, cover: 'context-cover' }),
      styles: { root: 'outline-offset:2px', cover: 'outline-offset:2px' }
    }}
    locale={translated ? { qrcode: { refresh: 'Reload code' } } : undefined}
  >
    <ConfigProvider qrcode={nested ? { class: 'nested-qrcode-context' } : undefined}>
      <div class="drawing-holder">
        {#if mounted}<QRCode
          {value}
          {type}
          {size}
          {status}
          {bordered}
          {iconSize}
          icon={src}
          errorLevel={level}
          boostLevel={boost}
          marginSize={margin}
          color={customColor ? '#800080' : undefined}
          bgColor={opaque ? '#fff' : undefined}
          onRefresh={refresh ? () => events.push('refresh') : undefined}
          statusRender={emptyStatus ? noStatus : customStatus ? replacement : undefined}
          onclick={() => events.push('root')}
          class="fixture-qrcode"
          rootClassName="qrcode-owner"
          title="QR root title"
          data-marker="qr-root"
          aria-label="Scannable QR code"
          classNames={({ props }) => ({ root: `local-${props.type}`, cover: 'local-cover' })}
          styles={styled ? {
            root: 'outline-offset:6px;width:888px;height:888px;color:rgb(255,0,0)',
            cover: 'outline-offset:4px;color:rgb(0,0,255)'
          } : undefined}
          style={dimensions ? 'width:100%;height:80%;outline-offset:8px' : undefined}
          bind:nativeElement
        />{/if}
      </div>
    </ConfigProvider>
    <div class="reference">
      <QRCode
        {value}
        type="svg"
        {size}
        {iconSize}
        icon={src}
        errorLevel={level}
        boostLevel={boost}
        marginSize={margin}
        color={customColor ? '#800080' : undefined}
        bgColor={opaque ? '#fff' : undefined}
        aria-label="Reference QR code"
        class="reference-qrcode"
      />
    </div>
  </ConfigProvider>
  <output aria-label="QRCode ref">{nativeElement?.tagName ?? 'none'}</output>
  <output aria-label="QRCode events">{events.join(',')}</output>
</section>
