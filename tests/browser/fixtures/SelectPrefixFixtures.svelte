<script lang="ts">
  import { ConfigProvider, SpaceCompact, Button, enUS } from 'antd-svelte';
  import SelectPrefixScope, { type SelectPrefixSample } from './SelectPrefixScope.svelte';
  import reference from './ant-design-select-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let multiple = $state(false);
  let portal = $state(false);
  let compact = $state(false);
  let sourceTheme = $state(true);
  let sample = $derived<SelectPrefixSample>(live ? {
    id: 'live', prefix, local: local || undefined, mode: multiple ? 'multiple' : undefined,
    portal, responsive: multiple
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as SelectPrefixSample);
</script>

<section id="select-prefix-fixture">
  <label>Select prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Select prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Select prefix</label>
  <label>Live Select prefix value<input bind:value={prefix} /></label>
  <label>Local Select prefix value<input bind:value={local} /></label>
  <label><input type="checkbox" bind:checked={multiple} /> Multiple prefix Select</label>
  <label><input type="checkbox" bind:checked={portal} /> Portal prefix Select</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact prefix Select</label>
  <label><input type="checkbox" bind:checked={sourceTheme} /> Source theme prefix Select</label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={sourceTheme ? { cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Select: {
        optionHeight: 36, optionFontSize: 17, multipleItemHeight: 26, fontSize: 16,
        selectorBg: '#fffbe6'
      } } : undefined } : undefined}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}>{@render widget()}</ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <SelectPrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}{@render widget()}{/if}
    {/key}
  </ConfigProvider>
</section>

{#snippet widget()}
  {#if compact}
    <SpaceCompact><SelectPrefixScope {sample} /><Button>Submit</Button></SpaceCompact>
  {:else}<SelectPrefixScope {sample} />{/if}
{/snippet}
