<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import DrawerPrefixScope, { type DrawerPrefixSample } from './DrawerPrefixScope.svelte';
  import reference from './ant-design-drawer-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as DrawerPrefixSample);
</script>

<section id="drawer-prefix-fixture">
  <label>Drawer prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Drawer prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Drawer prefix</label>
  <label>Live Drawer prefix value<input bind:value={prefix} /></label>
  <label>Local Drawer prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Drawer: {
        footerPaddingBlock: 14, footerPaddingInline: 22, padding: 20, paddingLG: 28,
        colorBgElevated: '#fffbe6'
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><DrawerPrefixScope {sample} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <DrawerPrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}<DrawerPrefixScope {sample} />{/if}
    {/key}
  </ConfigProvider>
</section>
