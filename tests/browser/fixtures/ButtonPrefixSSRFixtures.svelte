<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import ButtonPrefixScope from './ButtonPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <ButtonPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <ButtonPrefixScope scope="nested" sample={{ id: 'server', local: 'action', loading: true }} />
  </ConfigProvider>
</ConfigProvider>
