<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import ListyPrefixScope, { type ListyPrefixSample } from './ListyPrefixScope.svelte';
  import reference from './ant-design-listy-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as ListyPrefixSample);
</script>

<section id="listy-prefix-fixture">
  <label>Listy prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Listy prefix</label>
  <label>Live Listy prefix value <input bind:value={prefix} /></label>
  <label>Local Listy prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Listy: {
        itemPaddingBlock: 8, itemPaddingInline: 22, fontSize: 16, colorText: '#135200'
      } } : undefined }}>
    {#key sample.id}<ListyPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<ListyPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<ListyPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
</section>
