<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import TreeSelectPrefixScope, { type TreeSelectPrefixSample } from './TreeSelectPrefixScope.svelte';
  import reference from './ant-design-tree-select-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let multiple = $state(false);
  let portal = $state(false);
  let lazy = $state(false);
  let sample = $derived<TreeSelectPrefixSample>(live ? {
    id: 'live', prefix, local: local || undefined, mode: multiple ? 'multiple' : undefined, portal, lazy
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as TreeSelectPrefixSample);
</script>

<section id="tree-select-prefix-fixture">
  <label>TreeSelect prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>TreeSelect prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live TreeSelect prefix</label>
  <label>Live TreeSelect prefix value<input bind:value={prefix} /></label>
  <label>Local TreeSelect prefix value<input bind:value={local} /></label>
  <label><input type="checkbox" bind:checked={multiple} /> Multiple prefix TreeSelect</label>
  <label><input type="checkbox" bind:checked={portal} /> Portal prefix TreeSelect</label>
  <label><input type="checkbox" bind:checked={lazy} /> Lazy prefix TreeSelect</label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? {
        Select: { fontSize: 16, selectorBg: '#fffbe6' },
        TreeSelect: { titleHeight: 30, indentSize: 30 }
      } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><TreeSelectPrefixScope {sample} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <TreeSelectPrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}<TreeSelectPrefixScope {sample} />{/if}
    {/key}
  </ConfigProvider>
</section>
