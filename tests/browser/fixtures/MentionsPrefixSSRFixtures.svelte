<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import MentionsPrefixScope from './MentionsPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <MentionsPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <MentionsPrefixScope scope="nested" sample={{ id: 'server', local: 'mention' }} />
  </ConfigProvider>
</ConfigProvider>
