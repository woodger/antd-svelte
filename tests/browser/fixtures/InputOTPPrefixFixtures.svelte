<script lang="ts">
  import { ConfigProvider, InputOTP } from 'antd-svelte';
  import InputOTPPrefixScope, { type OTPPrefixSample } from './InputOTPPrefixScope.svelte';
  import reference from './ant-design-input-otp-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let dark = $state(false);
  let compact = $state(false);
  let sample = $derived(live ? {
    id: 'live', prefix, local: local || undefined, separator: true
  } : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
    .sample as OTPPrefixSample);
</script>

<section id="input-otp-prefix-fixture">
  <label>OTP prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live OTP prefix</label>
  <label>Live OTP prefix value <input bind:value={prefix} /></label>
  <label>Local OTP prefix value <input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Input: {
        paddingInline: 17, paddingBlock: 6, inputFontSize: 16, colorText: '#135200',
        borderRadius: 9, paddingXS: 10, paddingXXS: 5
      } } : undefined }}>
    {#key sample.id}<InputOTPPrefixScope scope="normal" {sample} />{/key}
    <ConfigProvider prefixCls={sample.childPrefix}>
      {#key sample.id}<InputOTPPrefixScope scope="nested" {sample} />{/key}
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    {#key sample.id}<InputOTPPrefixScope scope="sibling" {sample} local={false} />{/key}
  </ConfigProvider>
  <label><input type="checkbox" bind:checked={dark} /> Native OTP dark</label>
  <label><input type="checkbox" bind:checked={compact} /> Native OTP compact</label>
  <ConfigProvider prefixCls={prefix} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <InputOTP aria-label="Native prefixed OTP" data-native-otp="prefixed"
      length={4} defaultValue="12" mask />
    <ConfigProvider prefixCls="ant">
      <InputOTP aria-label="Native canonical OTP" data-native-otp="canonical"
        length={4} defaultValue="12" mask />
    </ConfigProvider>
  </ConfigProvider>
</section>
