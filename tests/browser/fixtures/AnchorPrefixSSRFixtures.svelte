<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import AnchorPrefixScope from './AnchorPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <AnchorPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <AnchorPrefixScope scope="nested" sample={{ id: 'server', local: 'nav' }} />
  </ConfigProvider>
</ConfigProvider>
