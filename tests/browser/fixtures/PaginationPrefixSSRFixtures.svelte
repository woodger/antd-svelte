<script lang="ts">
  import { ConfigProvider, Pagination } from 'antd-svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Pagination total={500} showSizeChanger={false} />
  <ConfigProvider prefixCls="inner">
    <Pagination prefixCls="pages" total={500} showQuickJumper showSizeChanger={false} />
  </ConfigProvider>
</ConfigProvider>
