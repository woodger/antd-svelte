<script lang="ts">
  import { ConfigProvider, Tour } from 'antd-svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Tour open steps={[{ title: 'Client title' }]} />
  <ConfigProvider prefixCls="inner">
    <Tour prefixCls="guide" open steps={[{ title: 'Nested client title' }]} />
  </ConfigProvider>
</ConfigProvider>
