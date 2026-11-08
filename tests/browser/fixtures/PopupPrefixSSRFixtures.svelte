<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import PopupPrefixScope, { type PopupPrefixKind } from './PopupPrefixScope.svelte';

  let { kind = 'tooltip' }: { kind?: PopupPrefixKind; } = $props();
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <PopupPrefixScope scope="normal" sample={{ id: 'ssr', kind }} />
  <ConfigProvider prefixCls="inner" theme={{ cssVar: { prefix: undefined } }}>
    <PopupPrefixScope scope="nested" sample={{ id: 'ssr', kind }} />
  </ConfigProvider>
</ConfigProvider>
