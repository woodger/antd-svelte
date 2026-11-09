<script lang="ts">
  import { ColorPicker, ConfigProvider } from 'antd-svelte';

  const presets = [{ label: 'Stored colors', colors: ['#1677ff'] }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <ColorPicker defaultValue="#1677ff" open {presets} />
  <ConfigProvider prefixCls="inner">
    <ColorPicker prefixCls="colors" defaultValue="#fa541c" format="rgb" open {presets} />
  </ConfigProvider>
</ConfigProvider>
