<script lang="ts">
  import { createNotification } from 'antd-svelte';
  import NotificationPrefixControl, { type NotificationPrefixSample } from './NotificationPrefixControl.svelte';

  let { sample, local = true }: { sample: NotificationPrefixSample; local?: boolean } = $props();
  const notification = createNotification({ duration: 0 });
</script>

<NotificationPrefixControl {sample} {notification} {local} />
