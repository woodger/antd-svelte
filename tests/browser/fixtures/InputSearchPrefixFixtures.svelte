<script lang="ts">
  import { ConfigProvider, InputSearch } from 'antd-svelte';
  import InputSearchPrefixScope, {
    type SearchPrefixSample
  } from './InputSearchPrefixScope.svelte';
  import reference from './ant-design-input-search-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let inputPrefix = $state('');
  let dark = $state(false);
  let compact = $state(false);
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, inputPrefix: inputPrefix || undefined,
    clear: true, count: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as SearchPrefixSample);
</script>

<section id="input-search-prefix-fixture">
  <label>Search prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Search prefix</label>
  <label>Live Search prefix value <input bind:value={prefix} /></label>
  <label>Local Search prefix value <input bind:value={local} /></label>
  <label>Local Search input prefix value <input bind:value={inputPrefix} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Input: {
        paddingInline: 17, paddingBlock: 6, inputFontSize: 16, colorText: '#135200',
        paddingBlockSM: 3, inputFontSizeSM: 18, lineHeight: 1.5, borderRadius: 9
      } } : undefined }}>
    {#key sample.id}
      <InputSearchPrefixScope scope="normal" {sample} global={sample.prefix || 'ant'} />
    {/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}
        <InputSearchPrefixScope scope="nested" {sample}
          global={sample.childPrefix || sample.prefix || 'ant'} />
      {/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<InputSearchPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
  <label><input type="checkbox" bind:checked={dark} /> Native Search dark</label>
  <label><input type="checkbox" bind:checked={compact} /> Native Search compact</label>
  <ConfigProvider prefixCls={prefix} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <InputSearch aria-label="Native prefixed Search" data-native-search="prefixed" allowClear showCount
      defaultValue="Draft" style="width:240px" />
    <ConfigProvider prefixCls="ant">
      <InputSearch aria-label="Native canonical Search" data-native-search="canonical" allowClear showCount
        defaultValue="Draft" style="width:240px" />
    </ConfigProvider>
  </ConfigProvider>
</section>
