<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import CardPrefixScope from './CardPrefixScope.svelte';
  import reference from './ant-design-card-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, grid: true, tabs: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="card-prefix-fixture">
  <label>Card prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Card prefix</label>
  <label>Live Card prefix value <input bind:value={prefix} /></label>
  <label>Local Card prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      components: 'aliases' in sample && sample.aliases ? { Card: {
        bodyPadding: 20, headerPadding: 18, headerFontSize: 22, tabsMarginBottom: -11,
        extraColor: '#531dab'
      } } : undefined }}>
    <CardPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <CardPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <CardPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
