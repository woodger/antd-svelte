<script lang="ts">
  import { ConfigProvider, TreeSelect } from 'antd-svelte';

  const treeData = [{ value: 'a', title: 'Alpha' }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <TreeSelect {treeData} defaultValue="a" defaultOpen />
  <ConfigProvider prefixCls="inner">
    <TreeSelect prefixCls="choices" {treeData} defaultValue="a" defaultOpen />
  </ConfigProvider>
</ConfigProvider>
