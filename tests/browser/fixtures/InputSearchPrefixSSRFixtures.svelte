<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import InputSearchPrefixScope from './InputSearchPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <InputSearchPrefixScope scope="normal" global="suite" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <InputSearchPrefixScope scope="nested" global="inner"
      sample={{ id: 'server', local: 'finder', inputPrefix: 'field', enterButton: true }} />
  </ConfigProvider>
</ConfigProvider>
