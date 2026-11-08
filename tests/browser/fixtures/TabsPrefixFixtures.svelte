<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import TabsPrefixScope from './TabsPrefixScope.svelte';
  import reference from './ant-design-tabs-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, overflow: true, editable: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="tabs-prefix-fixture">
  <label>Tabs prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Tabs prefix</label>
  <label>Live Tabs prefix value <input bind:value={prefix} /></label>
  <label>Local Tabs prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      components: 'aliases' in sample && sample.aliases ? { Tabs: {
        itemSelectedColor: '#531dab', titleFontSize: 18, horizontalItemGutter: 20, zIndexPopup: 1234
      } } : undefined }}>
    <TabsPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <TabsPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <TabsPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
