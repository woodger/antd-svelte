<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import WidgetPrefixScope from './WidgetPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <WidgetPrefixScope scope="server-normal" sample={{ id: 'ssr' }} />
  <ConfigProvider prefixCls="inner" theme={{ cssVar: { prefix: undefined } }}>
    <WidgetPrefixScope scope="server-nested" sample={{ id: 'ssr' }} />
  </ConfigProvider>
</ConfigProvider>
