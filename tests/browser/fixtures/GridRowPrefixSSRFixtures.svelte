<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import GridRowPrefixScope from './GridRowPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <GridRowPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <GridRowPrefixScope scope="nested" sample={{ id: 'server', local: 'line' }} />
  </ConfigProvider>
</ConfigProvider>
