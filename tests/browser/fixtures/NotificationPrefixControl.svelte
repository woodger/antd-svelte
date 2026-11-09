<script lang="ts">
  import { untrack } from 'svelte';
  import {
    Button, NotificationHolder, type NotificationInstance,
    type NotificationType, type NotificationPlacement
  } from 'antd-svelte';

  export interface NotificationPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    type?: NotificationType;
    placement?: NotificationPlacement;
    plain?: boolean;
    customIcon?: boolean;
    noTitle?: boolean;
    noActions?: boolean;
    noClose?: boolean;
    disabledClose?: boolean;
    userStyle?: boolean;
    app?: boolean;
  }
  let { sample, notification, holder = true, local = true }: {
    sample: NotificationPrefixSample;
    notification: NotificationInstance;
    holder?: boolean;
    local?: boolean;
  } = $props();
  let draft = $state('Draft');
  let events = $state<string[]>([]);
  untrack(() => notification.open({
    key: 'prefix',
    type: sample.plain ? undefined : sample.type ?? 'info',
    duration: 0,
    placement: sample.placement ?? 'topRight',
    class: 'fixture-notification-prefix',
    title: sample.noTitle ? undefined : 'Prefix notification',
    description: editor,
    actions: sample.noActions ? undefined : action,
    closable: sample.noClose ? false : sample.disabledClose ? { disabled: true } : undefined,
    icon: sample.customIcon ? icon : undefined,
    style: sample.userStyle ? 'padding:17px 29px;color:rgb(18, 52, 86)' : undefined,
    onClose: () => events.push('close')
  }));

  function timed() {
    notification.info({
      key: 'prefix', title: 'Timed prefix notification', description: editor,
      class: 'fixture-notification-prefix', duration: 2,
      onClose: () => events.push('close')
    });
  }
</script>

{#snippet editor()}<input aria-label="Notification prefix draft" bind:value={draft}
  style="width:160px;max-width:100%;padding:2px 4px;font:inherit" />{/snippet}
{#snippet icon()}<span>!</span>{/snippet}
{#snippet action()}<Button onclick={() => events.push('action')}>Action</Button>{/snippet}
{#if holder}<NotificationHolder {notification} prefixCls={local ? sample.local : undefined} />{/if}
<button type="button" onclick={timed}>Timed prefix Notification</button>
<output aria-label="Notification prefix events">{events.join('|')}</output>
