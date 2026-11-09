<script lang="ts">
  import { ConfigProvider, MessageHolder, createMessage } from 'antd-svelte';

  const message = createMessage();
  message.info('First queued message');
  const nested = createMessage();
  nested.success('Nested queued message');
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <MessageHolder {message} />
  <ConfigProvider prefixCls="inner">
    <MessageHolder message={nested} prefixCls="toast" />
  </ConfigProvider>
</ConfigProvider>
