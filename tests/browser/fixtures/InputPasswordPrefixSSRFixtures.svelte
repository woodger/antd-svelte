<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import InputPasswordPrefixScope from './InputPasswordPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <InputPasswordPrefixScope scope="normal" sample={{ id: 'server', clear: true }} />
  <ConfigProvider prefixCls="inner">
    <InputPasswordPrefixScope scope="nested"
      sample={{ id: 'server', local: 'secret', inputPrefix: 'field', count: true }} />
  </ConfigProvider>
</ConfigProvider>
