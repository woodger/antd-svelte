<script lang="ts">
  import { useApp } from 'antd-svelte';
  import MessagePrefixControl, { type MessagePrefixSample } from './MessagePrefixControl.svelte';

  let { sample }: { sample: MessagePrefixSample } = $props();
  const { message } = useApp();
</script>

<MessagePrefixControl {sample} {message} holder={false} />
