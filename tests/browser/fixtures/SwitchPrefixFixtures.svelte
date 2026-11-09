<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import SwitchPrefixScope, { type SwitchPrefixSample } from './SwitchPrefixScope.svelte';
  import reference from './ant-design-switch-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, labels: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as SwitchPrefixSample);
</script>

<section id="switch-prefix-fixture">
  <label>Switch prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Switch prefix</label>
  <label>Live Switch prefix value <input bind:value={prefix} /></label>
  <label>Local Switch prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Switch: {
        trackHeight: 28, trackMinWidth: 58, handleSize: 24, innerMinMargin: 7,
        innerMaxMargin: 31, handleBg: '#ffe58f'
      } } : undefined }}>
    {#key sample.id}<SwitchPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<SwitchPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<SwitchPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
</section>
