<script lang="ts">
  import { ConfigProvider, enUS, type ThemeConfig } from 'antd-svelte';
  import TablePrefixScope, { type TablePrefixSample } from './TablePrefixScope.svelte';
  import reference from './ant-design-table-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let dropdown = $state('');
  let mounted = $state(true);
  let fixed = $state(false);
  let paging = $state(false);
  let enabled = $state(true);
  let palette = $state('light-blue');
  let sample = $derived<TablePrefixSample>(live ? {
    id: 'live', prefix, local: local || undefined, dropdown: dropdown || undefined, mode: 'stateful', paging
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as TablePrefixSample);
  let rootPrefix = $derived(scope === 'sibling' ? 'ant' : scope === 'nested'
    ? sample.childPrefix || sample.prefix || 'ant' : sample.prefix || 'ant');
  let theme = $derived<ThemeConfig>(enabled ? {
    cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
    token: { motion: false }, components: sample.aliases ? { Table: {
      headerBg: '#fffbe6', rowSelectedBg: '#e6fffb', cellPaddingBlockMD: 9,
      cellFontSizeMD: 16, selectionColumnWidth: 54, filterDropdownBg: '#fff1f0',
      filterDropdownMenuBg: '#f6ffed'
    } } : undefined
  } : palette === 'dark-green' ? { mode: 'dark', primary: 'green' }
    : palette === 'compact-purple' ? { mode: 'light', primary: 'purple', compact: true }
      : { mode: 'light', primary: 'blue' });
</script>

<section id="table-prefix-fixture">
  <label>Table prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Table prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as value}<option value={value}>{value}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Table prefix</label>
  <label>Live Table prefix value<input bind:value={prefix} /></label>
  <label>Local Table prefix value<input bind:value={local} /></label>
  <label>Dropdown Table prefix value<input bind:value={dropdown} /></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount prefix Table</label>
  <label><input type="checkbox" bind:checked={fixed} /> Fixed prefix Table</label>
  <label><input type="checkbox" bind:checked={paging} /> Live Table paging</label>
  <label><input type="checkbox" bind:checked={enabled} /> Source prefix Table theme</label>
  <label>Default Table palette<select bind:value={palette}>
    {#each ['light-blue', 'dark-green', 'compact-purple'] as value}
      <option value={value}>{value}</option>
    {/each}
  </select></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    {theme}>
    {#key `${sample.id}:${scope}`}
      {#if mounted}
        {#if scope === 'nested'}
          <ConfigProvider prefixCls={sample.childPrefix}>
            <TablePrefixScope {sample} {rootPrefix} {fixed} />
          </ConfigProvider>
        {:else if scope === 'sibling'}
          <ConfigProvider prefixCls="ant" direction="ltr"
            theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
            <TablePrefixScope {sample} {rootPrefix} local={false} {fixed} />
          </ConfigProvider>
        {:else}<TablePrefixScope {sample} {rootPrefix} {fixed} />{/if}
      {/if}
    {/key}
  </ConfigProvider>
</section>
