<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import ListyPrefixScope from './ListyPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <ListyPrefixScope scope="normal" sample={{ id: 'server', short: true }} />
  <ConfigProvider prefixCls="inner">
    <ListyPrefixScope scope="nested" sample={{ id: 'server', local: 'records', short: true }} />
  </ConfigProvider>
</ConfigProvider>
