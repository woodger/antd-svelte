<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import InputPrefixScope, { type InputPrefixSample } from './InputPrefixScope.svelte';
  import reference from './ant-design-input-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, clear: true, count: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as InputPrefixSample);
</script>

<section id="input-prefix-fixture">
  <label>Input prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Input prefix</label>
  <label>Live Input prefix value <input bind:value={prefix} /></label>
  <label>Local Input prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Input: {
        paddingInline: 17, paddingBlock: 6, inputFontSize: 16, activeBorderColor: '#531dab',
        hoverBorderColor: '#9254de', colorText: '#135200', borderRadius: 9
      } } : undefined }}>
    {#key sample.id}<InputPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<InputPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<InputPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
</section>
