<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import ConfigPrefixScope from './ConfigPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <ConfigPrefixScope scope="server-normal" sample={{ id: 'ssr' }} />
  <ConfigProvider prefixCls="inner" theme={{ cssVar: { prefix: undefined } }}>
    <ConfigPrefixScope scope="server-nested" sample={{ id: 'ssr' }} />
  </ConfigProvider>
</ConfigProvider>
