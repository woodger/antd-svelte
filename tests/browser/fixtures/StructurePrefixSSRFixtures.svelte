<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import StructurePrefixScope from './StructurePrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <StructurePrefixScope scope="server-normal" sample={{ id: 'ssr' }} />
  <ConfigProvider prefixCls="inner" theme={{ cssVar: { prefix: undefined } }}>
    <StructurePrefixScope scope="server-nested" sample={{ id: 'ssr' }} />
  </ConfigProvider>
</ConfigProvider>
