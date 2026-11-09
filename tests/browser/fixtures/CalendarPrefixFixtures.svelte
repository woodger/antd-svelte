<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import CalendarPrefixScope, { type CalendarPrefixSample } from './CalendarPrefixScope.svelte';
  import reference from './ant-design-calendar-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let enabled = $state(true);
  let sample = $derived<CalendarPrefixSample>(live ? {
    id: 'live', prefix, local: local || undefined, mini: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as CalendarPrefixSample);
  let rootPrefix = $derived(scope === 'sibling' ? 'ant'
    : scope === 'nested' ? sample.childPrefix || sample.prefix || 'ant' : sample.prefix || 'ant');
</script>

<section id="calendar-prefix-fixture">
  <label>Calendar prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Calendar prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Calendar prefix</label>
  <label>Live Calendar prefix value<input bind:value={prefix} /></label>
  <label>Local Calendar prefix value<input bind:value={local} /></label>
  <label><input type="checkbox" bind:checked={enabled} /> Source prefix Calendar theme</label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={enabled ? {
      cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      token: { motion: false }, components: sample.aliases ? {
        Calendar: { yearControlWidth: 110, monthControlWidth: 100, miniContentHeight: 280,
          itemActiveBg: '#fff1b8', fontSize: 16 },
        Select: { fontSize: 15 }, Radio: { fontSize: 16 }
      } : undefined
    } : { mode: 'light', primary: 'blue' }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}>
          <CalendarPrefixScope {sample} {rootPrefix} />
        </ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr"
          theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
          <CalendarPrefixScope {sample} {rootPrefix} local={false} />
        </ConfigProvider>
      {:else}<CalendarPrefixScope {sample} {rootPrefix} />{/if}
    {/key}
  </ConfigProvider>
</section>
