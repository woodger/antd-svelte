<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import TreePrefixScope, { type TreePrefixSample } from './TreePrefixScope.svelte';
  import reference from './ant-design-tree-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let lazy = $state(false);
  let sample = $derived(live ? { id: `live-${lazy}`, prefix, local: local || undefined, lazy } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as TreePrefixSample);
</script>

<section id="tree-prefix-fixture">
  <label>Tree prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Tree prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Tree prefix</label>
  <label><input type="checkbox" bind:checked={lazy} /> Lazy prefix Tree</label>
  <label>Live Tree prefix value<input bind:value={prefix} /></label>
  <label>Local Tree prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Tree: {
        titleHeight: 30, switcherSize: 32, indentSize: 28, fontSize: 17, nodeSelectedBg: '#d3adf7'
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><TreePrefixScope {sample} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <TreePrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}<TreePrefixScope {sample} />{/if}
    {/key}
  </ConfigProvider>
</section>
