<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import TabsPrefixScope from './TabsPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <TabsPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <TabsPrefixScope scope="nested" sample={{ id: 'server', local: 'work-tabs', editable: true }} />
    <TabsPrefixScope scope="empty" sample={{ id: 'server', local: '' }} />
  </ConfigProvider>
</ConfigProvider>
