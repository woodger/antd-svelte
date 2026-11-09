<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import TransferPrefixScope, { type TransferPrefixSample } from './TransferPrefixScope.svelte';
  import reference from './ant-design-transfer-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let paged = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, mode: paged ? 'pagination' : 'basic'
  } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as TransferPrefixSample);
</script>

<section id="transfer-prefix-fixture">
  <label>Transfer prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Transfer prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Transfer prefix</label>
  <label><input type="checkbox" bind:checked={paged} /> Paged prefix Transfer</label>
  <label>Live Transfer prefix value<input bind:value={prefix} /></label>
  <label>Local Transfer prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Transfer: {
        listWidth: 210, listHeight: 230, itemHeight: 36, headerHeight: 44, fontSize: 17
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><TransferPrefixScope {sample} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <TransferPrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}<TransferPrefixScope {sample} />{/if}
    {/key}
  </ConfigProvider>
</section>
