<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import CascaderPrefixScope, { type CascaderPrefixSample } from './CascaderPrefixScope.svelte';
  import reference from './ant-design-cascader-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let multiple = $state(false);
  let panel = $state(false);
  let portal = $state(false);
  let sample = $derived<CascaderPrefixSample>(live ? {
    id: 'live', prefix, local: local || undefined, mode: multiple ? 'multiple' : undefined, panel, portal
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as CascaderPrefixSample);
</script>

<section id="cascader-prefix-fixture">
  <label>Cascader prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Cascader prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Cascader prefix</label>
  <label>Live Cascader prefix value<input bind:value={prefix} /></label>
  <label>Local Cascader prefix value<input bind:value={local} /></label>
  <label><input type="checkbox" bind:checked={multiple} /> Multiple prefix Cascader</label>
  <label><input type="checkbox" bind:checked={panel} /> Panel prefix Cascader</label>
  <label><input type="checkbox" bind:checked={portal} /> Portal prefix Cascader</label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? {
        Select: { fontSize: 16, selectorBg: '#fffbe6' },
        Cascader: { controlItemWidth: 160, dropdownHeight: 200, optionPadding: '7px 14px', fontSize: 16 }
      } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><CascaderPrefixScope {sample} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <CascaderPrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}<CascaderPrefixScope {sample} />{/if}
    {/key}
  </ConfigProvider>
</section>
