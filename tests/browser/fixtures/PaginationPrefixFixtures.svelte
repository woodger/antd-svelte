<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import PaginationPrefixScope, { type PaginationPrefixSample } from './PaginationPrefixScope.svelte';
  import reference from './ant-design-pagination-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined, quick: true } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as PaginationPrefixSample);
</script>

<section id="pagination-prefix-fixture">
  <label>Pagination prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Pagination prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Pagination prefix</label>
  <label>Live Pagination prefix value<input bind:value={prefix} /></label>
  <label>Local Pagination prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      token: sample.wireframe ? { wireframe: true } : undefined,
      components: sample.aliases ? { Pagination: {
        itemSize: 38, itemActiveColor: '#135200', itemActiveBg: '#fffbe6', marginXS: 12
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><PaginationPrefixScope {sample} {scope} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <PaginationPrefixScope {sample} {scope} local={false} />
        </ConfigProvider>
      {:else}<PaginationPrefixScope {sample} {scope} />{/if}
    {/key}
  </ConfigProvider>
</section>
