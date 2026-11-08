<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import MasonryPrefixScope from './MasonryPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <MasonryPrefixScope scope="normal" sample={{ id: 'ssr' }} />
  <ConfigProvider prefixCls="inner">
    <MasonryPrefixScope scope="nested" sample={{ id: 'ssr' }} />
  </ConfigProvider>
</ConfigProvider>
