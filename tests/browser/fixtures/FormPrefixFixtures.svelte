<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import FormPrefixScope, { type FormPrefixSample } from './FormPrefixScope.svelte';
  import reference from './ant-design-form-prefix-reference.json';
  import FormPrefixNativeOwners from './FormPrefixNativeOwners.svelte';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let itemLocal = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, itemLocal: itemLocal || undefined
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as FormPrefixSample);
</script>

<section id="form-prefix-fixture">
  <label>Form prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Form prefix</label>
  <label>Live Form prefix value <input bind:value={prefix} /></label>
  <label>Local Form prefix value <input bind:value={local} /></label>
  <label>Local FormItem prefix value <input bind:value={itemLocal} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      token: sample.media ? {
        screenXSMax: 639, screenSMMin: 640, screenSM: 640, screenSMMax: 849,
        screenMDMin: 850, screenMD: 850, screenMDMax: 1079,
        screenLGMin: 1080, screenLG: 1080, screenLGMax: 1319,
        screenXLMin: 1320, screenXL: 1320
      } : sample.narrowMedia ? {
        screenXSMin: 320, screenXS: 320, screenXSMax: 399,
        screenSMMin: 400, screenSM: 400, screenSMMax: 699,
        screenMDMin: 700, screenMD: 700, screenMDMax: 899,
        screenLGMin: 900, screenLG: 900
      } : undefined,
      components: sample.aliases ? { Form: {
        itemMarginBottom: 17, labelColor: '#135200', labelFontSize: 16,
        labelHeight: 36, verticalLabelPadding: '6px 0', verticalLabelMargin: 3
      } } : undefined }}>
    {#key sample.id}<FormPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<FormPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<FormPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
  <ConfigProvider prefixCls={prefix} theme={{ cssVar: {}, token: { motion: false } }}>
    <FormPrefixNativeOwners />
  </ConfigProvider>
</section>
