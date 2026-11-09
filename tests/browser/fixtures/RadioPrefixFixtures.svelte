<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import RadioPrefixScope, { type RadioPrefixSample } from './RadioPrefixScope.svelte';
  import reference from './ant-design-radio-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, button: true, solid: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as RadioPrefixSample);
</script>

<section id="radio-prefix-fixture">
  <label>Radio prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Radio prefix</label>
  <label>Live Radio prefix value <input bind:value={prefix} /></label>
  <label>Local Radio prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Radio: {
        radioSize: 20, dotSize: 10, buttonPaddingInline: 19, buttonSolidCheckedBg: '#531dab',
        buttonSolidCheckedColor: '#fff', wrapperMarginInlineEnd: 13
      } } : undefined }}>
    <RadioPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={sample.childPrefix}>
      <RadioPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <RadioPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
