<script lang="ts">
  import { untrack } from 'svelte';
  import { MessageHolder, type MessageInstance, type MessageType } from 'antd-svelte';

  export interface MessagePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    type?: MessageType;
    multiline?: boolean;
    customIcon?: boolean;
    top?: number | string;
    userStyle?: boolean;
    app?: boolean;
  }
  let { sample, message, holder = true, local = true }: {
    sample: MessagePrefixSample;
    message: MessageInstance;
    holder?: boolean;
    local?: boolean;
  } = $props();
  let draft = $state('Draft');
  let events = $state<string[]>([]);
  untrack(() => message.open({
    key: 'prefix',
    type: sample.type ?? 'info',
    duration: 0,
    class: 'fixture-message-prefix',
    content: sample.multiline ? multiline : 'Prefix message',
    icon: sample.customIcon ? icon : undefined,
    style: sample.userStyle ? 'padding:7px 19px;color:rgb(18, 52, 86)' : undefined,
    onClose: () => events.push('close')
  }));

  function timed() {
    const handle = message.info({
      key: 'prefix', content: 'Timed prefix message', class: 'fixture-message-prefix',
      duration: 2, onClose: () => events.push('close')
    });
    void handle.then(value => events.push(`done:${value}`));
  }
</script>

{#snippet multiline()}<span>First line<br />Second line</span>{/snippet}
{#snippet icon()}<span>!</span>{/snippet}
{#if holder}<MessageHolder {message} prefixCls={local ? sample.local : undefined} top={sample.top} />{/if}
<input aria-label="Message prefix draft" bind:value={draft} />
<button type="button" onclick={timed}>Timed prefix Message</button>
<button type="button" onclick={() => message.destroy()}>Dismiss prefix Message</button>
<output aria-label="Message prefix events">{events.join('|')}</output>
