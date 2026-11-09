<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import GridColPrefixScope, { type ColPrefixSample } from './GridColPrefixScope.svelte';
  import reference from './ant-design-grid-col-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let formLocal = $state(false);
  let sample = $derived({
    ...(live ? { id: 'live', prefix, local: local || undefined, responsiveFlex: true }
      : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
        .sample as ColPrefixSample),
    formLocal
  });
</script>

<section id="grid-col-prefix-fixture">
  <label>Col prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Col prefix</label>
  <label>Live Col prefix value <input bind:value={prefix} /></label>
  <label>Local Col prefix value <input bind:value={local} /></label>
  <label><input type="checkbox" bind:checked={formLocal} /> Local Form column prefixes</label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      token: sample.media ? {
        screenXSMax: 639, screenSMMin: 640, screenSM: 640, screenSMMax: 849,
        screenMDMin: 850, screenMD: 850, screenMDMax: 1079,
        screenLGMin: 1080, screenLG: 1080, screenLGMax: 1319,
        screenXLMin: 1320, screenXL: 1320, screenXLMax: 1659,
        screenXXLMin: 1660, screenXXL: 1660, screenXXLMax: 1979,
        screenXXXLMin: 1980, screenXXXL: 1980
      } : undefined }}>
    {#key sample.id}<GridColPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<GridColPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<GridColPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
</section>
