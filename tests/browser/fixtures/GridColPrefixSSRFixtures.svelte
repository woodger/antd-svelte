<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import GridColPrefixScope from './GridColPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <GridColPrefixScope scope="normal" sample={{ id: 'server', responsive: true }} />
  <ConfigProvider prefixCls="inner">
    <GridColPrefixScope scope="nested"
      sample={{ id: 'server', local: 'column', responsiveFlex: true }} />
  </ConfigProvider>
</ConfigProvider>
