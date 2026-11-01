<script lang="ts">
  import { Button, ConfigProvider, Input, InputNumber, SpaceAddon, TextArea } from 'antd-svelte';
  let { native = false }: { native?: boolean; } = $props();
</script>

<ConfigProvider theme={native ? { compact: true } : {
  cssVar: { key: 'control-ssr' },
  components: {
    Button: { fontWeight: 600, defaultBg: '#123456' },
    Input: { inputFontSize: 17, paddingInline: 5 },
    InputNumber: { handleWidth: 36, controlWidth: 170 },
    Addon: { colorText: '#a011bb' }
  }
}}>
  <Button>Source Button</Button>
  <Input id="plain" defaultValue="Input" />
  <Input id="grouped" addonBefore="HTTPS" defaultValue="Input" />
  <TextArea id="area" allowClear defaultValue="Text" />
  <InputNumber defaultValue={3} />
  <SpaceAddon>Addon</SpaceAddon>
</ConfigProvider>
