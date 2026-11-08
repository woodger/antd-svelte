<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import SplitterPrefixScope from './SplitterPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <SplitterPrefixScope scope="normal" sample={{ id: 'server', lazy: true }} />
  <ConfigProvider prefixCls="inner">
    <SplitterPrefixScope scope="nested" sample={{ id: 'server', local: 'panes', lazy: true }} />
  </ConfigProvider>
</ConfigProvider>
