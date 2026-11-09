<script lang="ts">
  import { untrack } from 'svelte';
  import MessageHolder from './MessageHolder.svelte';
  import NotificationHolder from './NotificationHolder.svelte';
  import ModalHolder from './ModalHolder.svelte';
  import { createMessage, messageHolderKey } from './message.model.svelte.js';
  import { createNotification, notificationOptionsKey } from './notification.model.svelte.js';
  import { createModal } from './modal.model.svelte.js';
  import { provideApp, useAppOptions } from './app-context';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import type { AppOptions, AppProps } from './app.types';

  let {
    children,
    component = 'div',
    prefixCls,
    message,
    notification,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: AppProps = $props();
  const config = useConfig();
  const parent = useAppOptions();
  const componentTheme = useComponentTheme('App');
  let componentPrefix = $derived(config.getPrefixCls('app', prefixCls));
  let messageOptions = $derived({ ...parent?.message, ...message });
  let notificationOptions = $derived({ ...parent?.notification, ...notification });
  const api = {
    message: createMessage(untrack(() => messageOptions)),
    notification: createNotification(untrack(() => notificationOptions)),
    modal: createModal()
  };
  const options: AppOptions = {
    get message() { return messageOptions; },
    get notification() { return notificationOptions; }
  };
  provideApp(api, options);

  $effect.pre(() => {
    api.message[messageHolderKey].configure(messageOptions);
    api.notification[notificationOptionsKey](notificationOptions);
  });
</script>

<style>
  [data-ant-app-root] { color: var(--ant-color-text); font-size: var(--ant-font-size); line-height: var(--ant-line-height); font-family: var(--ant-font-family); }
</style>

{#snippet content()}
  <ModalHolder modal={api.modal} />
  <MessageHolder message={api.message} prefixCls={messageOptions.prefixCls} top={messageOptions.top} />
  <NotificationHolder notification={api.notification}
    top={notificationOptions.top} bottom={notificationOptions.bottom} />
  {@render children?.()}
{/snippet}

{#if component === false}
  {@render content()}
{:else}
  <svelte:element this={component} {...rest} bind:this={nativeElement} data-ant-app-root=""
    dir={config.direction} class={[
      componentPrefix,
      'ant-app-css-var',
      componentTheme.className,
      config.direction === 'rtl' && `${componentPrefix}-rtl`,
      config.app?.class,
      className,
      rootClassName
    ]} style={[componentTheme.style, config.app?.style, style].filter(Boolean).join(';')}>
    {@render content()}
  </svelte:element>
{/if}
