<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import StatusPrefixScope from './StatusPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <StatusPrefixScope scope="server-normal" sample={{ id: 'ssr' }} />
  <ConfigProvider prefixCls="inner" theme={{ cssVar: { prefix: undefined } }}>
    <StatusPrefixScope scope="server-nested" sample={{ id: 'ssr' }} />
  </ConfigProvider>
</ConfigProvider>
