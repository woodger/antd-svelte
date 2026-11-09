<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import CheckboxPrefixScope from './CheckboxPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <CheckboxPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <CheckboxPrefixScope scope="nested" sample={{ id: 'server', local: 'choice', mixed: true }} />
  </ConfigProvider>
</ConfigProvider>
