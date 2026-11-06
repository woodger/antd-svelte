<script lang="ts" module>
  import type { AffixReferenceTheme } from './affix-theme-presets';

  export interface AffixConfigSample {
    name: string;
    prefix?: string;
    config: AffixReferenceTheme;
    native?: { mode: 'light' | 'dark'; compact?: boolean; };
  }
</script>

<script lang="ts">
  import { ConfigProvider, type AffixConfig } from 'antd-svelte';
  import { resolveAffixTheme } from './affix-theme-presets';
  import AffixThemeControl from './AffixThemeControl.svelte';

  let { sample, mounted = true }: { sample: AffixConfigSample; mounted?: boolean; } = $props();
  let prefix = $state<string>();
  let replaced = $state(false);
  let configured = $derived(sample.native ?? resolveAffixTheme(sample.config));
  let localPrefix = $derived(prefix ?? sample.prefix);
  let common = $derived<AffixConfig>(replaced
    ? { class: 'updated-affix', style: 'opacity:0.65;outline-offset:7px' }
    : { class: 'provider-affix', style: 'opacity:0.5;outline-offset:6px' });
</script>

<button type="button" onclick={() => prefix = 'next-affix'}>Set alternate Affix prefix</button>
<button type="button" onclick={() => prefix = ''}>Use default Affix prefix</button>
<button type="button" onclick={() => replaced = !replaced}>Replace Affix config</button>
{#if mounted}
  <ConfigProvider theme={configured} affix={common}>
    <AffixThemeControl id="normal" prefixCls={localPrefix} />
    <AffixThemeControl id="explicit" prefixCls={localPrefix}
      style="opacity:0.8;outline-offset:9px" />
    <ConfigProvider affix={undefined}>
      <AffixThemeControl id="inherited" prefixCls={localPrefix} />
    </ConfigProvider>
    <ConfigProvider affix={{ class: 'replacement-affix', style: 'opacity:0.3' }}>
      <AffixThemeControl id="replaced" prefixCls={localPrefix} />
    </ConfigProvider>
    <ConfigProvider affix={{}}>
      <AffixThemeControl id="cleared" prefixCls={localPrefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}
  affix={{ class: 'outside-affix', style: 'opacity:0.6' }}>
  <AffixThemeControl id="outside" />
</ConfigProvider>
