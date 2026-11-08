<script lang="ts">
  import { ConfigProvider, QRCode, type ThemeConfig } from 'antd-svelte';
  import type { QRCodePrefixSample } from './qrcode-prefix-cases';

  let { sample }: { sample: QRCodePrefixSample } = $props();
  let refreshes = $state(0);
  let legacyDark = $state(false);
  let resolvedTheme = $derived<ThemeConfig>(legacyDark ? { mode: 'dark' } : {
    ...sample.theme, token: { motion: false, ...sample.theme?.token }
  });
  let siblingTheme = $derived<ThemeConfig>(legacyDark ? { mode: 'dark' } : {
    token: { motion: false }
  });
  let styles = $derived({
    root: sample.styles?.root?.padding !== undefined
      ? `padding:${sample.styles.root.padding}px` : undefined,
    cover: [sample.styles?.cover?.backgroundColor
      && `background-color:${sample.styles.cover.backgroundColor}`,
    sample.styles?.cover?.color && `color:${sample.styles.cover.color}`].filter(Boolean).join(';')
  });
</script>

{#snippet code(id: string)}
  <div data-qrcode-prefix={id}
    data-prefix={id === 'sibling' ? 'ant-qrcode' : sample.prefixCls || 'ant-qrcode'}>
    <QRCode value="https://ant.design" type={sample.type} status={sample.status}
      bordered={sample.bordered} prefixCls={id === 'sibling' ? undefined : sample.prefixCls}
      {styles} onRefresh={() => { refreshes++; }} />
  </div>
{/snippet}

<ConfigProvider direction={sample.direction} theme={resolvedTheme}>
  {@render code('normal')}
  {@render code('nested')}
</ConfigProvider>
<ConfigProvider direction={sample.direction} theme={siblingTheme}>{@render code('sibling')}</ConfigProvider>
<label><input type="checkbox" bind:checked={legacyDark} />Legacy dark QRCode prefix theme</label>
<output aria-label="QRCode prefix refreshes">{refreshes}</output>
