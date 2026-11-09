<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import PickerPrefixScope, {
    type PickerPrefixKind, type PickerPrefixSample
  } from './PickerPrefixScope.svelte';
  import reference from './ant-design-picker-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let kind = $state<PickerPrefixKind>('date');
  let prefix = $state('suite');
  let local = $state('');
  let enabled = $state(true);
  let portal = $state(false);
  let mounted = $state(true);
  let format = $state<string>();
  let sample = $derived<PickerPrefixSample>(live ? {
    id: `live:${kind}`, kind, prefix, local: local || undefined, portal, format
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as PickerPrefixSample);
  let rootPrefix = $derived(scope === 'sibling' ? 'ant'
    : scope === 'nested' ? sample.childPrefix || sample.prefix || 'ant' : sample.prefix || 'ant');
</script>

<section id="picker-prefix-fixture">
  <label>Picker prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Picker prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live picker prefix</label>
  <label>Live picker kind<select bind:value={kind}>
    {#each ['date', 'datetime', 'range', 'datetime-range', 'time', 'time-range'] as mode}<option value={mode}>{mode}</option>{/each}
  </select></label>
  <label>Live picker prefix value<input bind:value={prefix} /></label>
  <label>Local picker prefix value<input bind:value={local} /></label>
  <label><input type="checkbox" bind:checked={enabled} /> Source prefix picker theme</label>
  <label><input type="checkbox" bind:checked={portal} /> Portal prefix picker</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount prefix picker</label>
  <button type="button" onclick={() => { format = 'YYYY/MM/DD'; }}>Use slash picker format</button>
  <div id="picker-prefix-portal"></div>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={enabled ? {
      cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      token: { motion: false }, components: sample.aliases ? {
        DatePicker: { paddingBlock: 7, paddingInline: 15, inputFontSize: 18,
          timeColumnWidth: 72, timeCellHeight: 36, cellHeight: 32 },
        Button: { fontSize: 16, controlHeightSM: 28 }
      } : undefined
    } : { mode: 'light', primary: 'blue' }}>
    {#if mounted}
      {#key `${sample.id}:${scope}`}
        {#if scope === 'nested'}
          <ConfigProvider prefixCls={sample.childPrefix}>
            <PickerPrefixScope {sample} {rootPrefix} />
          </ConfigProvider>
        {:else if scope === 'sibling'}
          <ConfigProvider prefixCls="ant" direction="ltr"
            theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
            <PickerPrefixScope {sample} {rootPrefix} local={false} />
          </ConfigProvider>
        {:else}<PickerPrefixScope {sample} {rootPrefix} />{/if}
      {/key}
    {/if}
  </ConfigProvider>
</section>
