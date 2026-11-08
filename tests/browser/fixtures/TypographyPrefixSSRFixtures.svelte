<script lang="ts">
  import { ConfigProvider, TypographyParagraph } from 'antd-svelte';
  import TypographyPrefixScope from './TypographyPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <TypographyPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <TypographyPrefixScope scope="nested" sample={{ id: 'server', local: 'prose' }} />
    <TypographyParagraph prefixCls="" editable={{ editing: true, autoSize: false }}
      children="Server editing draft" />
  </ConfigProvider>
</ConfigProvider>
