<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import TypographyPrefixScope from './TypographyPrefixScope.svelte';
  import reference from './ant-design-typography-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="typography-prefix-fixture">
  <label>Typography prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Typography prefix</label>
  <label>Live Typography prefix value <input bind:value={prefix} /></label>
  <label>Local Typography prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      components: 'aliases' in sample && sample.aliases
        ? { Typography: { fontSize: 22, titleMarginTop: 25, titleMarginBottom: 9 } } : undefined }}>
    <TypographyPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <TypographyPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <TypographyPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
