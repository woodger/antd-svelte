<script lang="ts">
  import { Checkbox, CheckboxGroup, ConfigProvider, Radio, RadioButton, RadioGroup,
    Switch, theme, type ThemeConfig } from 'antd-svelte';

  const presets: Record<string, ThemeConfig> = {
    default: {},
    dark: { algorithm: theme.darkAlgorithm },
    compact: { algorithm: theme.compactAlgorithm },
    'dark-compact': { algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] },
    'custom-global': { token: {
      fontSize: 18, controlHeight: 44, lineWidth: 2, colorPrimary: '#00b96b', colorWhite: '#eeeeee'
    } },
    wireframe: { token: { wireframe: true, fontSizeLG: 20, lineWidth: 2 } },
    'own-radio': { components: { Radio: {
      radioSize: 24, dotSize: 10, buttonPaddingInline: 18, wrapperMarginInlineEnd: 13,
      buttonSolidCheckedBg: '#facc00', buttonColor: '#123456'
    } } },
    'own-switch': { components: { Switch: {
      trackHeight: 31, trackHeightSM: 19, trackMinWidth: 62, trackMinWidthSM: 38,
      trackPadding: 3, handleSize: 25, handleSizeSM: 13, handleBg: '#ffeeaa',
      handleShadow: '0 0 1px red', innerMaxMargin: 30, innerMaxMarginSM: 19
    } } },
    'checkbox-aliases': { components: { Checkbox: {
      controlInteractiveSize: 25, colorPrimary: '#00b96b', colorBorder: '#123456',
      borderRadiusSM: 2, lineWidth: 2
    } } },
    'component-algorithms': { components: {
      Radio: { colorPrimary: '#00b96b', fontSize: 19, algorithm: true },
      Switch: { colorPrimary: '#123456', fontSize: 17, algorithm: theme.darkAlgorithm },
      Checkbox: { colorPrimary: '#a011cc', algorithm: true }
    } },
    'zero-component-values': { components: {
      Radio: { radioSize: 0, dotSize: 0, buttonPaddingInline: 0, wrapperMarginInlineEnd: 0 },
      Switch: { trackHeight: 0, trackHeightSM: 0, handleSize: 0, handleSizeSM: 0,
        trackMinWidth: 0, trackMinWidthSM: 0, trackPadding: 0 },
      Checkbox: { controlInteractiveSize: 0, lineWidth: 0 }
    } },
    'undefined-component-values': { components: {
      Radio: { radioSize: undefined, dotSize: undefined },
      Switch: { trackHeight: undefined, handleSize: undefined }
    } },
    'custom-prefix': { cssVar: { prefix: 'Toggle2' }, components: {
      Radio: { radioSize: 23, colorPrimary: '#00b96b', algorithm: true },
      Switch: { trackHeight: 27 },
      Checkbox: { controlInteractiveSize: 21 }
    } }
  };
  let preset = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let hashed = $state(true);
  let inherited = $state(true);
  let changes = $state(0);
  let config = $derived<ThemeConfig>({
    ...presets[preset],
    cssVar: { ...presets[preset].cssVar, key: 'toggle-source-scope' },
    hashed
  });
</script>

<section id="toggle-theme-fixture">
  <h2>Source checkable tokens</h2>
  <label>Checkable token preset <select bind:value={preset} aria-label="Checkable token preset">
    {#each Object.keys(presets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed checkables</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source checkable tokens</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed checkables</label>
  <label><input type="checkbox" bind:checked={inherited} /> Inherit child checkables</label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : undefined}>
      <form id="toggle-theme-form">
        <Radio id="themed-radio" name="single-radio" defaultChecked
          onChange={() => changes++}>Themed radio</Radio>
        <Checkbox id="themed-checkbox" name="single-check" value="chosen" defaultChecked
          onChange={() => changes++}>Themed checkbox</Checkbox>
        <Switch id="themed-switch" aria-label="Themed switch" name="single-switch" defaultChecked
          onChange={() => changes++} />
        <Switch id="themed-small-switch" aria-label="Themed small switch" size="small" defaultChecked />
        <RadioGroup id="themed-radio-group" aria-label="Themed radio group" name="group-radio"
          defaultValue="one" options={['one', 'two']} />
        <RadioGroup id="themed-button-group" aria-label="Themed button group" name="group-buttons"
          defaultValue="one" buttonStyle="solid">
          <RadioButton value="one">Button one</RadioButton>
          <RadioButton value="two">Button two</RadioButton>
        </RadioGroup>
        <CheckboxGroup id="themed-checkbox-group" aria-label="Themed checkbox group" name="group-check"
          defaultValue={['one']} options={['one', 'two']} />
        <Switch id="toggle-style-priority" aria-label="Style priority switch" defaultChecked
          styles={{ root: '--ant-switch-track-height:35px' }}
          style="--ant-switch-track-height:37px" />
        <button type="reset">Reset themed checkables</button>
      </form>
      <ConfigProvider theme={{ inherit: inherited }}>
        <Checkbox id="nested-themed-checkbox" defaultChecked>Nested themed checkbox</Checkbox>
      </ConfigProvider>
    </ConfigProvider>
  {/if}
  <Checkbox id="outside-themed-checkbox" defaultChecked>Outside themed checkbox</Checkbox>
  <output aria-label="Checkable change count">{changes}</output>
</section>
