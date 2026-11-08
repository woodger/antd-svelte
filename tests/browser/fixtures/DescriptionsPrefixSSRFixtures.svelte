<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import DescriptionsPrefixScope from './DescriptionsPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <DescriptionsPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <DescriptionsPrefixScope scope="nested" sample={{ id: 'server', local: 'details', bordered: true }} />
    <DescriptionsPrefixScope scope="empty" sample={{ id: 'server', local: '' }} />
  </ConfigProvider>
</ConfigProvider>
