<script lang="ts">
  import { ConfigProvider, Tree, TreeSelect } from 'antd-svelte';

  const data = [{ key: 'p', title: 'Parent', children: [{ key: 'a', title: 'Alpha' }] }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Tree treeData={data} defaultExpandAll checkable />
  <ConfigProvider prefixCls="inner">
    <Tree prefixCls="nodes" treeData={data} defaultExpandAll checkable />
    <TreeSelect treeData={[{ value: 'p', title: 'Parent' }]} />
  </ConfigProvider>
</ConfigProvider>
