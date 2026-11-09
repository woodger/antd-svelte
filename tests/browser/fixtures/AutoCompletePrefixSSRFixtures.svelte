<script lang="ts">
  import { AutoComplete, ConfigProvider } from 'antd-svelte';

  const options = [{ value: 'a', label: 'Alpha' }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <AutoComplete {options} defaultValue="a" defaultOpen />
  <ConfigProvider prefixCls="inner">
    <AutoComplete prefixCls="choices" {options} defaultValue="a" defaultOpen />
  </ConfigProvider>
</ConfigProvider>
