<script lang="ts">
  import { untrack } from 'svelte';
  import { Button, createNotification, NotificationHolder, type NotificationType } from 'antd-svelte';

  let {
    mode = 'default',
    scope = 'normal',
    prefix = 'ant',
    priority = false,
    editable = false
  }: {
    mode?: string;
    scope?: string;
    prefix?: string;
    priority?: boolean;
    editable?: boolean;
  } = $props();
  let events = $state<string[]>([]);
  const notification = createNotification({ duration: 0 });
  let holderStyle = $derived(scope === 'holder-style'
    ? `--${prefix}-notification-z-index-popup:2600;--${prefix}-notification-width:450px`
    : undefined);

  untrack(() => {
    const type: NotificationType | undefined = mode === 'plain' ? undefined
      : mode === 'success' || mode === 'warning' || mode === 'error' ? mode : 'info';
    const style = [
      (priority || scope === 'priority') && 'color:rgb(0,128,0);padding:5px 19px',
      scope === 'variable' && `--${prefix}-notification-width:310px`
    ].filter(Boolean).join(';');

    notification.open({
      key: 'theme',
      type,
      title: mode === 'no-title' ? undefined : 'Notification title',
      description: mode === 'no-description' ? undefined : 'Notification text',
      actions: mode === 'no-actions' ? undefined : actions,
      icon: mode === 'custom-icon' ? icon : undefined,
      closable: mode !== 'no-close',
      placement: mode === 'bottomLeft' ? 'bottomLeft' : 'topRight',
      style,
      onClose: () => events.push('close')
    });
  });
</script>

{#snippet icon()}<span>!</span>{/snippet}
{#snippet actions()}
  {#if editable}
    <form aria-label="Notification theme form">
      <input aria-label="Notification draft" name="draft" value="Draft" />
    </form>
  {/if}
  <Button onclick={() => events.push('action')}>Action</Button>
{/snippet}

<NotificationHolder {notification} style={holderStyle} />
<button type="button" onclick={() => notification.destroy('theme')}>Dismiss themed notification</button>
<button type="button" onclick={() => notification.info({
    key: 'theme', title: 'Reopened notification', actions
  })}>Open another themed notification</button>
<button type="button" onclick={() => notification.info({
    key: 'timed',
    title: 'Timed notification',
    class: 'timed-theme-notification',
    duration: 1,
    onClose: () => events.push('timed-close')
  })}>Open timed themed notification</button>
<output aria-label="Notification theme events">{JSON.stringify(events)}</output>
