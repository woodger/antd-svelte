<script lang="ts">
  import { Button, ConfigProvider, Input, InputNumber, InputPassword, InputSearch, InputOTP,
    SpaceAddon, TextArea, theme, type ThemeConfig } from 'antd-svelte';

  let mounted = $state(true);
  let enabled = $state(true);
  let dark = $state(false);
  let inherited = $state(true);
  let customPrefix = $state(false);
  let hashed = $state(true);
  let font = $state(17);
  let width = $state(36);
  let buttonColor = $state('#ff0000');
  let config = $derived<ThemeConfig>({
    cssVar: { prefix: customPrefix ? 'MyScope2' : 'ant', key: 'control-source-scope' },
    algorithm: dark ? [theme.darkAlgorithm, theme.compactAlgorithm] : theme.defaultAlgorithm,
    hashed,
    token: { colorPrimary: '#1677ff' },
    components: {
      Button: { colorPrimary: buttonColor, algorithm: true, fontWeight: 600, iconGap: 3 },
      Input: { colorPrimary: '#00b96b', algorithm: true, inputFontSize: font, paddingInline: 5 },
      InputNumber: { handleWidth: width, handleVisible: true, inputFontSize: font, controlWidth: 170 },
      Addon: { colorText: '#a011bb' }
    }
  });
</script>

<section id="control-theme-fixture">
  <h2>Source control tokens</h2>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source control tokens</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark compact controls</label>
  <label><input type="checkbox" bind:checked={inherited} /> Inherit child controls</label>
  <label><input type="checkbox" bind:checked={customPrefix} /> Custom control CSS prefix</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed controls</label>
  <label>Input token font <input type="number" bind:value={font} /></label>
  <label>Handle token width <input type="number" bind:value={width} /></label>
  <label>Button token primary <input bind:value={buttonColor} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : undefined} class="control-source-provider">
      <Button id="themed-primary" type="primary">Themed primary</Button>
      <Button id="themed-icon-gap" icon="plus">Themed icon gap</Button>
      <Input id="themed-input" aria-label="Themed plain input" defaultValue="Input" />
      <Input id="themed-affix" aria-label="Themed affix input" prefix="@" allowClear defaultValue="Affix" />
      <Input id="themed-group" aria-label="Themed grouped input" addonBefore="HTTPS" defaultValue="Grouped" />
      <TextArea id="themed-textarea" aria-label="Themed plain textarea" rows={2} defaultValue="Text" />
      <TextArea id="themed-wrapped-textarea" aria-label="Themed wrapped textarea" allowClear showCount
        defaultValue="Wrapped" />
      <InputNumber id="themed-number" aria-label="Themed number" defaultValue={3} />
      <InputNumber id="themed-addon-number" aria-label="Themed addon number" addonBefore="USD" defaultValue={3} />
      <InputPassword id="themed-password" aria-label="Themed password" defaultValue="Password" />
      <InputSearch id="themed-search" aria-label="Themed search" enterButton defaultValue="Search" />
      <InputOTP aria-label="Themed OTP" length={3} defaultValue="123" />
      <Button id="themed-style-priority" styles={{ root: '--ant-button-content-font-size:21px' }}
        style="--ant-button-content-font-size:23px">Style priority</Button>
      <SpaceAddon id="themed-addon">Addon text</SpaceAddon>
      <SpaceAddon id="themed-nesting-parent">
        <Button id="themed-nested-button">Nested button</Button>
      </SpaceAddon>
      <ConfigProvider>
        <Input aria-label="Inherited plain input" id="inherited-control-input" />
      </ConfigProvider>
      <ConfigProvider theme={{ inherit: inherited }}>
        <Input aria-label="Reset control input" id="reset-control-input" />
      </ConfigProvider>
    </ConfigProvider>
  {/if}
  <Button id="outside-control-primary" type="primary">Outside primary</Button>
</section>
