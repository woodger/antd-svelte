<script lang="ts">
  import { ConfigProvider, Transfer } from 'antd-svelte';

  const data = [{ key: 'a', title: 'Alpha' }, { key: 'b', title: 'Beta' }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Transfer dataSource={data} render={item => item.title} showSearch />
  <ConfigProvider prefixCls="inner">
    <Transfer prefixCls="lists" dataSource={data} render={item => item.title}
      pagination={{ pageSize: 1 }} />
  </ConfigProvider>
</ConfigProvider>
