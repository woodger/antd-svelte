<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import DescriptionsPrefixScope from './DescriptionsPrefixScope.svelte';
  import reference from './ant-design-descriptions-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="descriptions-prefix-fixture">
  <label>Descriptions prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Descriptions prefix</label>
  <label>Live Descriptions prefix value <input bind:value={prefix} /></label>
  <label>Local Descriptions prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      components: 'aliases' in sample && sample.aliases ? { Descriptions: {
        fontSize: 20, titleMarginBottom: 23, itemPaddingBottom: 18, labelColor: '#531dab',
        contentColor: '#0958d9'
      } } : undefined }}>
    <DescriptionsPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <DescriptionsPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <DescriptionsPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
