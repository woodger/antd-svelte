<script lang="ts">
  import { createMessage } from 'antd-svelte';
  import MessagePrefixControl, { type MessagePrefixSample } from './MessagePrefixControl.svelte';

  let { sample, local = true }: { sample: MessagePrefixSample; local?: boolean } = $props();
  const message = createMessage({ duration: 0 });
</script>

<MessagePrefixControl {sample} {message} {local} />
