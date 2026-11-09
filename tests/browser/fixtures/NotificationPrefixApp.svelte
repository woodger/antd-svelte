<script lang="ts">
  import { useApp } from 'antd-svelte';
  import NotificationPrefixControl, { type NotificationPrefixSample } from './NotificationPrefixControl.svelte';

  let { sample }: { sample: NotificationPrefixSample } = $props();
  const { notification } = useApp();
</script>

<NotificationPrefixControl {sample} {notification} holder={false} />
