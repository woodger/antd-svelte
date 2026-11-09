<script lang="ts">
  import { ConfigProvider, InputNumber } from 'antd-svelte';
  import InputNumberPrefixScope, {
    type NumberPrefixSample
  } from './InputNumberPrefixScope.svelte';
  import reference from './ant-design-input-number-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let dark = $state(false);
  let compact = $state(false);
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, affix: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as NumberPrefixSample);
</script>

<section id="input-number-prefix-fixture">
  <label>InputNumber prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live InputNumber prefix</label>
  <label>Live InputNumber prefix value <input bind:value={prefix} /></label>
  <label>Local InputNumber prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { InputNumber: {
        controlWidth: 130, paddingInline: 15, paddingBlock: 6, inputFontSize: 16,
        handleWidth: 24, handleVisible: true, activeBorderColor: '#531dab',
        colorText: '#135200', borderRadius: 9
      } } : undefined }}>
    {#key sample.id}<InputNumberPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<InputNumberPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<InputNumberPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
  <label><input type="checkbox" bind:checked={dark} /> Native InputNumber dark</label>
  <label><input type="checkbox" bind:checked={compact} /> Native InputNumber compact</label>
  <ConfigProvider prefixCls={prefix} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <InputNumber aria-label="Native prefixed number" size="small" defaultValue={1.25} />
    <ConfigProvider prefixCls="ant">
      <InputNumber aria-label="Native canonical number" size="small" defaultValue={1.25} />
    </ConfigProvider>
  </ConfigProvider>
</section>
