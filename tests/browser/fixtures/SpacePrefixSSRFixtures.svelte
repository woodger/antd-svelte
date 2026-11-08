<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import SpacePrefixScope from './SpacePrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <SpacePrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <SpacePrefixScope scope="nested" sample={{
      id: 'server', local: 'flow', compact: 'group', addon: 'cell'
    }} />
  </ConfigProvider>
</ConfigProvider>
