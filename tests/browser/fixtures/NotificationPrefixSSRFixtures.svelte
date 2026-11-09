<script lang="ts">
  import { ConfigProvider, NotificationHolder, createNotification } from 'antd-svelte';

  const notification = createNotification();
  notification.info({ title: 'First queued notification' });
  const nested = createNotification();
  nested.success({ title: 'Nested queued notification' });
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <NotificationHolder {notification} />
  <ConfigProvider prefixCls="inner">
    <NotificationHolder notification={nested} prefixCls="toast" />
  </ConfigProvider>
</ConfigProvider>
