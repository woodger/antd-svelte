<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import GridRowPrefixScope from './GridRowPrefixScope.svelte';
  import reference from './ant-design-grid-row-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="grid-row-prefix-fixture">
  <label>Row prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Row prefix</label>
  <label>Live Row prefix value <input bind:value={prefix} /></label>
  <label>Local Row prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      components: 'aliases' in sample && sample.aliases ? { Grid: { fontSize: 22 } } : undefined }}>
    <GridRowPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <GridRowPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <GridRowPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
