<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import TourPrefixScope, { type TourPrefixSample } from './TourPrefixScope.svelte';
  import reference from './ant-design-tour-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as TourPrefixSample);
</script>

<section id="tour-prefix-fixture">
  <label>Tour prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Tour prefix scope <select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Tour prefix</label>
  <label>Live Tour prefix value <input bind:value={prefix} /></label>
  <label>Local Tour prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} locale={enUS} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Tour: {
        closeBtnSize: 32, padding: 20, fontSize: 16, marginXS: 14, colorPrimary: '#135200'
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}>
          <TourPrefixScope {sample} draft={live} />
        </ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <TourPrefixScope {sample} local={false} draft={live} />
        </ConfigProvider>
      {:else}<TourPrefixScope {sample} draft={live} />{/if}
    {/key}
  </ConfigProvider>
</section>
