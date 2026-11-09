<script lang="ts">
  import { Button, ConfigProvider } from 'antd-svelte';
  import ButtonPrefixScope, { type ButtonPrefixSample } from './ButtonPrefixScope.svelte';
  import reference from './ant-design-button-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let dark = $state(false);
  let compact = $state(false);
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as ButtonPrefixSample);
</script>

<section id="button-prefix-fixture">
  <label>Button prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Button prefix</label>
  <label>Live Button prefix value <input bind:value={prefix} /></label>
  <label>Local Button prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      components: 'aliases' in sample && sample.aliases ? { Button: {
        defaultBg: '#ffe58f', defaultColor: '#531dab', defaultBorderColor: '#722ed1',
        contentFontSize: 17, paddingInline: 19, iconGap: 13, borderRadius: 9
      } } : undefined }}>
    <ButtonPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <ButtonPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <ButtonPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
  <span id="button-prefix-target">Target</span>
  <label><input type="checkbox" bind:checked={dark} /> Native Button dark</label>
  <label><input type="checkbox" bind:checked={compact} /> Native Button compact</label>
  <ConfigProvider prefixCls={prefix} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <Button aria-label="Native prefixed Button">Native</Button>
    <ConfigProvider prefixCls="ant">
      <Button aria-label="Native canonical Button">Native</Button>
    </ConfigProvider>
  </ConfigProvider>
</section>
