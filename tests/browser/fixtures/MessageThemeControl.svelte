<script lang="ts">
  import { untrack } from 'svelte';
  import { createMessage, MessageHolder, type MessageType } from 'antd-svelte';

  let {
    mode = 'default',
    scope = 'normal',
    prefix = 'ant',
    priority = false
  }: {
    mode?: string;
    scope?: string;
    prefix?: string;
    priority?: boolean;
  } = $props();
  let events = $state<string[]>([]);
  const message = createMessage({ duration: 0 });
  let holderStyle = $derived(scope === 'holder-style'
    ? `z-index:2600;--${prefix}-message-content-bg:#fff0f6` : undefined);
  const handle = untrack(() => {
    const type: MessageType = mode === 'success' || mode === 'warning'
      || mode === 'error' || mode === 'loading' ? mode : 'info';
    const style = [
      (priority || scope === 'priority') && 'color:rgb(0,128,0);padding:5px 19px',
      scope === 'variable' && `--${prefix}-message-content-padding:3px 17px`
    ].filter(Boolean).join(';');

    return message.open({
      key: 'theme',
      type,
      content: mode === 'multiline' ? multiline : 'Message text',
      icon: mode === 'custom-icon' ? icon : undefined,
      style,
      onClose: () => events.push('close')
    });
  });
  void handle.then(closed => events.push(`done:${closed}`));
</script>

{#snippet icon()}<span>!</span>{/snippet}
{#snippet multiline()}<span>First line<br />Second line</span>{/snippet}
<MessageHolder {message} style={holderStyle} />
<form aria-label="Message theme form">
  <input aria-label="Message outside draft" name="draft" value="Draft" />
</form>
<button type="button" onclick={() => handle()}>Dismiss themed message</button>
<button type="button" onclick={() => message.info({ key: 'theme', content: 'Reopened message' })}>
  Open another themed message
</button>
<button type="button" onclick={() => message.info({ key: 'theme', content: 'unbroken'.repeat(60) })}>
  Show long themed message
</button>
<button type="button" onclick={() => message.info({
    key: 'timed',
    content: 'Timed message',
    class: 'timed-theme-message',
    duration: 1,
    onClose: () => events.push('timed-close')
  })}>Open timed themed message</button>
<output aria-label="Message theme events">{JSON.stringify(events)}</output>
