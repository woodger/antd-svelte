<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import SwitchPrefixScope from './SwitchPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <SwitchPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <SwitchPrefixScope scope="nested" sample={{ id: 'server', local: 'toggle', checked: true }} />
  </ConfigProvider>
</ConfigProvider>
