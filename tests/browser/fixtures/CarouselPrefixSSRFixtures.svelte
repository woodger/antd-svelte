<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import CarouselPrefixScope from './CarouselPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <CarouselPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <CarouselPrefixScope scope="nested" sample={{ id: 'server', local: 'gallery' }} />
    <CarouselPrefixScope scope="empty" sample={{ id: 'server', local: '' }} />
  </ConfigProvider>
</ConfigProvider>
