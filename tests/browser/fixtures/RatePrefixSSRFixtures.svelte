<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import RatePrefixScope from './RatePrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <RatePrefixScope scope="normal" sample={{ id: 'server', half: true }} />
  <ConfigProvider prefixCls="inner">
    <RatePrefixScope scope="nested" sample={{
      id: 'server', local: 'review', value: 2.5, half: true, character: true
    }} />
  </ConfigProvider>
</ConfigProvider>
