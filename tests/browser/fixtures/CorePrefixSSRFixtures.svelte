<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import CorePrefixScope from './CorePrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <CorePrefixScope scope="server-normal" sample={{ id: 'ssr' }} />
  <ConfigProvider prefixCls="inner" theme={{ cssVar: { prefix: undefined } }}>
    <CorePrefixScope scope="server-nested" sample={{ id: 'ssr' }} />
  </ConfigProvider>
</ConfigProvider>
