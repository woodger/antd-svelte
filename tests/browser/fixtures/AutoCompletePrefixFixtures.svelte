<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import AutoCompletePrefixScope, { type AutoCompletePrefixSample } from './AutoCompletePrefixScope.svelte';
  import reference from './ant-design-auto-complete-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let input = $state('');
  let portal = $state(false);
  let sourceTheme = $state(true);
  let sample = $derived<AutoCompletePrefixSample>(live ? {
    id: 'live', prefix, local: local || undefined, input: input || undefined, portal
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as AutoCompletePrefixSample);
</script>

<section id="auto-complete-prefix-fixture">
  <label>AutoComplete prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>AutoComplete prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live AutoComplete prefix</label>
  <label>Live AutoComplete prefix value<input bind:value={prefix} /></label>
  <label>Local AutoComplete prefix value<input bind:value={local} /></label>
  <label>AutoComplete prefix input<select bind:value={input}>
    <option value="">native</option><option value="input">Input</option>
    <option value="textarea">TextArea</option>
  </select></label>
  <label><input type="checkbox" bind:checked={portal} /> Portal prefix AutoComplete</label>
  <label><input type="checkbox" bind:checked={sourceTheme} /> Source theme prefix AutoComplete</label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={sourceTheme ? { cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Select: {
        optionHeight: 36, optionFontSize: 17, multipleItemHeight: 26, fontSize: 16,
        selectorBg: '#fffbe6'
      } } : undefined } : undefined}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}><AutoCompletePrefixScope {sample} /></ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          <AutoCompletePrefixScope {sample} local={false} />
        </ConfigProvider>
      {:else}<AutoCompletePrefixScope {sample} />{/if}
    {/key}
  </ConfigProvider>
</section>
