<script lang="ts">
  import { untrack } from 'svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getNotificationPrefixCss } from './notification-prefix.engine';
  import NotificationNotice from './NotificationNotice.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectInlineStyle } from './inline-style.dom';
  import { serializeInlineStyleLayers, type InlineStyleLayer } from './inline-style.engine';
  import { notificationHolderKey, notificationPlacements } from './notification.model.svelte.js';
  import { connectNoticeSurface } from './notice.dom';
  import type { NotificationHolderProps } from './notification.types';

  let {
    notification,
    prefixCls: customizePrefixCls,
    top = 24,
    bottom = 24,
    id,
    class: className = '',
    style
  }: NotificationHolderProps = $props();
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('notification', customizePrefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let prefixCss = $derived(getNotificationPrefixCss(componentPrefix, rootPrefix));
  const componentTheme = useComponentTheme('Notification');
  let anchor = $state<HTMLSpanElement>();
  let surface = $state<HTMLDivElement>();
  let runtime = $derived(notification[notificationHolderKey]);
  let notices = $derived(runtime.notices);
  let resolvedTop = $derived(Number.isFinite(top) && top >= 0 ? top : 24);
  let resolvedBottom = $derived(Number.isFinite(bottom) && bottom >= 0 ? bottom : 24);
  let rootLayers = $derived<readonly InlineStyleLayer[]>([
    componentTheme.style,
    style,
    [
      ['--notification-top', `${resolvedTop}px`],
      ['--notification-bottom', `${resolvedBottom}px`]
    ]
  ]);
  let rootStyle = $derived(serializeInlineStyleLayers(rootLayers));

  function connectRootStyle(node: HTMLDivElement) {
    const update = connectInlineStyle(node);
    $effect(() => update(rootLayers));
  }

  function connectHost(node: HTMLSpanElement) {
    const view = node.ownerDocument.defaultView!;
    return runtime.connect({
      now: () => view.performance.now(),
      schedule(callback, milliseconds) {
        const timer = view.setTimeout(callback, milliseconds);
        return () => view.clearTimeout(timer);
      }
    });
  }

  $effect(() => {
    const node = surface;
    const origin = anchor;
    const current = runtime;
    if (node
      && origin) return untrack(() => connectNoticeSurface(node, origin, current.setVisible));
  });
</script>

<style>
  .ant-notification-anchor { position: absolute; width: 0; height: 0; pointer-events: none; visibility: hidden; }
  .ant-notification-surface { position: fixed; inset: auto; top: var(--ant-svelte-notice-viewport-top, 0px); left: 0; width: 100%; height: var(--ant-svelte-notice-viewport-height, 100dvh); max-width: 100vw; max-height: none; margin: 0; border: 0; padding: 0; overflow: hidden; background: transparent; pointer-events: none; outline: none; }
  .ant-notification-surface:not(:popover-open) { display: none; }
  .ant-notification-surface::backdrop { pointer-events: none; background: transparent; }
  .ant-notification-surface > [data-ant-notification-root][data-ant-notification-list] { position: absolute; height: auto; max-width: 100%; max-height: calc(100% - max(0px, var(--notification-top) - var(--ant-margin-lg))); }
  .ant-notification-surface > [data-ant-notification-root][data-ant-notification-list][data-placement^='bottom'] { max-height: calc(100% - max(0px, var(--notification-bottom) - var(--ant-margin-lg))); }
  .ant-notification-surface [data-ant-notification-content] { pointer-events: none; }
  [data-placement^='bottom'] > [data-ant-notification-content] { flex-direction: column-reverse; }
</style>

<span bind:this={anchor} class="ant-notification-anchor" aria-hidden="true" {@attach connectHost}></span>
{#key notification}
  {#if notices.length}
    {#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`notification-prefix:${componentPrefix}:${rootPrefix}`} />{/if}<div bind:this={surface}
      data-ant-notification-prefix={componentPrefix} data-ant-notification-root-prefix={rootPrefix} popover="manual" {id} dir={config.direction}
      class={['ant-notification-surface ant-notification-css-var', componentTheme.className, className]}
      style={untrack(() => rootStyle)} {@attach connectRootStyle}>
      {#each notificationPlacements as placement}
        {@const items = notices.filter((notice) => notice.placement === placement)}
        {#if items.length}
          <div data-ant-notification-root data-ant-notification-list
            data-ant-notification-prefix={componentPrefix} data-ant-notification-root-prefix={rootPrefix} class={[
              `${componentPrefix} ${componentPrefix}-list`,
              `${componentPrefix}-${placement}`,
              config.direction === 'rtl' && `${componentPrefix}-rtl`
            ]} data-placement={placement}>
            <div data-ant-notification-content class={`${componentPrefix}-list-content`}>{#each items as notice (notice.id)}<NotificationNotice {notice} {notification} prefixCls={componentPrefix} />{/each}</div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
{/key}
