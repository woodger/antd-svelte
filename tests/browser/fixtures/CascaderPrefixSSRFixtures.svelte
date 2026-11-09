<script lang="ts">
  import { Cascader, CascaderPanel, ConfigProvider } from 'antd-svelte';

  const options = [{ value: 'a', label: 'Alpha' }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Cascader {options} defaultValue={['a']} defaultOpen />
  <ConfigProvider prefixCls="inner">
    <CascaderPanel prefixCls="paths" {options} />
  </ConfigProvider>
</ConfigProvider>
