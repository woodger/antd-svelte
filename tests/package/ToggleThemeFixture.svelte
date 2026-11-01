<script lang="ts">
  import { Checkbox, CheckboxGroup, ConfigProvider, Radio, RadioButton, RadioGroup,
    Switch, type ThemeConfig } from 'antd-svelte';

  let { native = false, missing = false, prefix = 'ant' }: {
    native?: boolean; missing?: boolean; prefix?: string;
  } = $props();
  let config = $derived<ThemeConfig>({
    cssVar: { key: 'toggle-ssr', prefix },
    components: {
      Radio: { radioSize: missing ? undefined : 24, dotSize: missing ? undefined : 10 },
      Checkbox: { controlInteractiveSize: 25, colorPrimary: '#00b96b' },
      Switch: { trackHeight: missing ? undefined : 31, handleSize: missing ? undefined : 25 }
    }
  });
</script>

<ConfigProvider theme={native ? { compact: true } : config}>
  <Radio id="ssr-radio" defaultChecked>Source radio</Radio>
  <Checkbox id="ssr-checkbox" defaultChecked>Source checkbox</Checkbox>
  <Switch id="ssr-switch" defaultChecked aria-label="Source switch" />
  <RadioGroup id="ssr-radio-group" defaultValue="one" options={['one', 'two']} />
  <CheckboxGroup id="ssr-checkbox-group" defaultValue={['one']} options={['one', 'two']} />
  <RadioGroup id="ssr-button-group" defaultValue="one" buttonStyle="solid">
    <RadioButton value="one">Source button</RadioButton>
  </RadioGroup>
</ConfigProvider>
