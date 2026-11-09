<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import DropdownPrefixScope, { type DropdownPrefixSample } from './DropdownPrefixScope.svelte';
  import reference from './ant-design-dropdown-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as DropdownPrefixSample);
</script>

<section id="dropdown-prefix-fixture">
  <label>Dropdown prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Dropdown prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Dropdown prefix</label>
  <label>Live Dropdown prefix value<input bind:value={prefix} /></label>
  <label>Local Dropdown prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? {
        Dropdown: { paddingBlock: 9, colorBgElevated: '#fffbe6', controlHeightLG: 48 },
        Menu: { fontSize: 16, itemHeight: 48, itemColor: '#135200' }
      } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><DropdownPrefixScope {sample} {scope} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <DropdownPrefixScope {sample} {scope} local={false} />
        </ConfigProvider>
      {:else}<DropdownPrefixScope {sample} {scope} />{/if}
    {/key}
  </ConfigProvider>
</section>
