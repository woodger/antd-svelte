<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import InputPasswordPrefixScope, {
    type PasswordPrefixSample
  } from './InputPasswordPrefixScope.svelte';
  import reference from './ant-design-input-password-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let inputPrefix = $state('');
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, inputPrefix: inputPrefix || undefined,
    clear: true, count: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as PasswordPrefixSample);
</script>

<section id="input-password-prefix-fixture">
  <label>Password prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Password prefix</label>
  <label>Live Password prefix value <input bind:value={prefix} /></label>
  <label>Local Password prefix value <input bind:value={local} /></label>
  <label>Local Password input prefix value <input bind:value={inputPrefix} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Input: {
        paddingInline: 17, paddingBlock: 6, inputFontSize: 16, colorText: '#135200',
        borderRadius: 9, colorIcon: '#531dab', colorIconHover: '#9254de'
      } } : undefined }}>
    {#key sample.id}<InputPasswordPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<InputPasswordPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<InputPasswordPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
</section>
