<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import BreadcrumbPrefixScope from './BreadcrumbPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <BreadcrumbPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <BreadcrumbPrefixScope scope="nested" sample={{ id: 'server', local: 'trail' }} />
  </ConfigProvider>
</ConfigProvider>
