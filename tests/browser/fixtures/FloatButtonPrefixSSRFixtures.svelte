<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import FloatButtonPrefixScope from './FloatButtonPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <FloatButtonPrefixScope scope="normal" sample={{ id: 'server' }} rootPrefix="suite" />
  <ConfigProvider prefixCls="inner">
    <FloatButtonPrefixScope scope="nested" sample={{ id: 'server', local: 'floating', menu: true }}
      rootPrefix="inner" />
  </ConfigProvider>
</ConfigProvider>
