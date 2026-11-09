<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import RadioPrefixScope from './RadioPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <RadioPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <RadioPrefixScope scope="nested" sample={{ id: 'server', local: 'choice', button: true }} />
  </ConfigProvider>
</ConfigProvider>
