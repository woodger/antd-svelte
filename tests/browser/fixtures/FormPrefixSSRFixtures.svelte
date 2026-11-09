<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import FormPrefixScope from './FormPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <FormPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <FormPrefixScope scope="nested"
      sample={{ id: 'server', local: 'editor', itemLocal: 'field', tooltip: true }} />
  </ConfigProvider>
</ConfigProvider>
