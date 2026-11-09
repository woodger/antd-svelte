<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import MentionsPrefixScope, { type MentionsPrefixSample } from './MentionsPrefixScope.svelte';
  import reference from './ant-design-mentions-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as MentionsPrefixSample);
</script>

<section id="mentions-prefix-fixture">
  <label>Mentions prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Mentions prefix</label>
  <label>Live Mentions prefix value <input bind:value={prefix} /></label>
  <label>Local Mentions prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Mentions: {
        paddingInline: 13, paddingBlock: 5, inputFontSize: 16,
        controlItemWidth: 140, dropdownHeight: 144, activeBorderColor: '#135200'
      } } : undefined }}>
    {#key sample.id}<MentionsPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<MentionsPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<MentionsPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
</section>
