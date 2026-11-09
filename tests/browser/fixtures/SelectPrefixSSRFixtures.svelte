<script lang="ts">
  import { ConfigProvider, Select } from 'antd-svelte';

  const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Select {options} defaultValue="b" defaultOpen />
  <ConfigProvider prefixCls="inner">
    <Select prefixCls="choices" {options} mode="multiple" defaultValue={['a']} defaultOpen />
  </ConfigProvider>
</ConfigProvider>
