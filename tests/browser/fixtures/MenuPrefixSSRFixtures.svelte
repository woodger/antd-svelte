<script lang="ts">
  import { ConfigProvider, Menu } from 'antd-svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Menu items={[{ key: 'normal', label: 'Normal' }]} />
  <ConfigProvider prefixCls="inner">
    <Menu prefixCls="navigation" mode="inline" defaultOpenKeys={['parent']}
      items={[{ key: 'parent', label: 'Parent', children: [{ key: 'leaf', label: 'Leaf' }] }]} />
  </ConfigProvider>
</ConfigProvider>
