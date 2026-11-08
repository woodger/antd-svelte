<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import BeamGlobalScope from './BeamGlobalScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <BeamGlobalScope scope="server-normal" sample={{ id: 'ssr', local: 'shared-beam' }} />
  <ConfigProvider prefixCls="inner">
    <BeamGlobalScope scope="server-nested" sample={{ id: 'ssr', local: 'shared-beam' }} />
  </ConfigProvider>
</ConfigProvider>
