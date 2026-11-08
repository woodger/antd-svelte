<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import SpacePrefixScope, { type SpacePrefixSample } from './SpacePrefixScope.svelte';
  import reference from './ant-design-space-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived<SpacePrefixSample>(live ? {
    id: 'live', prefix, local: local || undefined,
    compact: local ? `${local}-group` : undefined, addon: local ? `${local}-cell` : undefined
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as SpacePrefixSample);
</script>

<section id="space-prefix-fixture">
  <label>Space prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Space prefix</label>
  <label>Live Space prefix value <input bind:value={prefix} /></label>
  <label>Local Space prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      token: { motion: false }, components: sample.aliases ? {
        Space: { paddingXS: 11 }, Addon: { colorText: '#722ed1', paddingSM: 15 }
      } : undefined }}>
    <SpacePrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={sample.childPrefix}>
      <SpacePrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <SpacePrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
