<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import CheckboxPrefixScope, { type CheckboxPrefixSample } from './CheckboxPrefixScope.svelte';
  import reference from './ant-design-checkbox-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as CheckboxPrefixSample);
</script>

<section id="checkbox-prefix-fixture">
  <label>Checkbox prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Checkbox prefix</label>
  <label>Live Checkbox prefix value <input bind:value={prefix} /></label>
  <label>Local Checkbox prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Checkbox: {
        controlInteractiveSize: 20, borderRadiusSM: 6, colorPrimary: '#531dab',
        colorPrimaryHover: '#9254de', colorText: '#135200'
      } } : undefined }}>
    <CheckboxPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={sample.childPrefix}>
      <CheckboxPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <CheckboxPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
