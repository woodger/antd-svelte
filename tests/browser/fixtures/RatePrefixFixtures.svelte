<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import RatePrefixScope, { type RatePrefixSample } from './RatePrefixScope.svelte';
  import reference from './ant-design-rate-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, half: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as RatePrefixSample);
</script>

<section id="rate-prefix-fixture">
  <label>Rate prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Rate prefix</label>
  <label>Live Rate prefix value <input bind:value={prefix} /></label>
  <label>Local Rate prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Rate: {
        starSize: 28, starSizeSM: 18, starSizeLG: 34, starColor: '#135200',
        starBg: '#ffe58f', starHoverScale: 'scale(1.3)'
      } } : undefined }}>
    {#key sample.id}<RatePrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<RatePrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<RatePrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
</section>
