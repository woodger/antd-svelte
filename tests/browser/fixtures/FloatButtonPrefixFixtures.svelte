<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import FloatButtonPrefixScope, {
    type FloatButtonPrefixSample
  } from './FloatButtonPrefixScope.svelte';
  import reference from './ant-design-float-button-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, menu: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as FloatButtonPrefixSample);
</script>

<section id="float-button-prefix-fixture">
  <label>FloatButton prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live FloatButton prefix</label>
  <label>Live FloatButton prefix value <input bind:value={prefix} /></label>
  <label>Local FloatButton prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? {
        FloatButton: { controlHeightLG: 48, padding: 18, paddingXXS: 6, fontSizeSM: 13,
          lineWidthBold: 3 },
        Button: { defaultBg: '#ffe58f', defaultColor: '#531dab' }
      } : undefined }}>
    <FloatButtonPrefixScope scope="normal" {sample} rootPrefix={sample.prefix || 'ant'} />
    <ConfigProvider prefixCls={sample.childPrefix}>
      <FloatButtonPrefixScope scope="nested" {sample}
        rootPrefix={sample.childPrefix || sample.prefix || 'ant'} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <FloatButtonPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
