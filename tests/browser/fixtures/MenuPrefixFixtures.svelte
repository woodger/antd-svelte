<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import MenuPrefixScope, { type MenuPrefixSample } from './MenuPrefixScope.svelte';
  import reference from './ant-design-menu-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let mode = $state<'inline' | 'vertical' | 'horizontal' | 'collapsed'>('inline');
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as MenuPrefixSample);
</script>

<section id="menu-prefix-fixture">
  <label>Menu prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Menu prefix mode<select bind:value={mode}>
    {#each ['inline', 'vertical', 'horizontal', 'collapsed'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label>Menu prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Menu prefix</label>
  <label>Live Menu prefix value<input bind:value={prefix} /></label>
  <label>Local Menu prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Menu: { itemHeight: 46, itemSelectedBg: '#fffbe6', fontSize: 16 } } : undefined }}>
    {#key `${sample.id}:${scope}:${mode}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><MenuPrefixScope {sample} {scope} {mode} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <MenuPrefixScope {sample} {scope} {mode} local={false} />
        </ConfigProvider>
      {:else}<MenuPrefixScope {sample} {scope} {mode} />{/if}
    {/key}
  </ConfigProvider>
</section>
