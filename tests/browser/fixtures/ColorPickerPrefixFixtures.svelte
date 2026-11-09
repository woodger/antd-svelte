<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import ColorPickerPrefixScope, {
    type ColorPickerPrefixSample
  } from './ColorPickerPrefixScope.svelte';
  import reference from './ant-design-color-picker-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let portal = $state(false);
  let custom = $state(false);
  let enabled = $state(true);
  let mounted = $state(true);
  let sample = $derived<ColorPickerPrefixSample>(live ? {
    id: 'live', prefix, local: local || undefined, portal, custom
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as ColorPickerPrefixSample);
  let rootPrefix = $derived(scope === 'sibling' ? 'ant'
    : scope === 'nested' ? sample.childPrefix || sample.prefix || 'ant' : sample.prefix || 'ant');
</script>

<section id="color-picker-prefix-fixture">
  <label>ColorPicker prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>ColorPicker prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live ColorPicker prefix</label>
  <label>Live ColorPicker prefix value<input bind:value={prefix} /></label>
  <label>Local ColorPicker prefix value<input bind:value={local} /></label>
  <label><input type="checkbox" bind:checked={portal} /> Portal prefix ColorPicker</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom prefix ColorPicker</label>
  <label><input type="checkbox" bind:checked={enabled} /> Source prefix ColorPicker theme</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount prefix ColorPicker</label>
  <div id="color-prefix-portal"></div>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={enabled ? {
      cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      token: { motion: false },
      components: sample.aliases ? {
        ColorPicker: { fontSize: 16, marginSM: 18, controlHeight: 36 },
        Popover: { borderRadiusLG: 14 }, Input: { colorBgContainer: '#fffbe6' },
        Select: { fontSize: 15 }
      } : undefined
    } : { mode: 'light', primary: 'blue' }}>
    {#if mounted}
      {#key `${sample.id}:${scope}`}
        {#if scope === 'nested'}
          <ConfigProvider prefixCls={sample.childPrefix}>
            <ColorPickerPrefixScope {sample} {rootPrefix} />
          </ConfigProvider>
        {:else if scope === 'sibling'}
          <ConfigProvider prefixCls="ant" direction="ltr"
            theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
            <ColorPickerPrefixScope {sample} {rootPrefix} local={false} />
          </ConfigProvider>
        {:else}<ColorPickerPrefixScope {sample} {rootPrefix} />{/if}
      {/key}
    {/if}
  </ConfigProvider>
</section>
