<script lang="ts">
  import { untrack } from 'svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getMessagePrefixCss } from './message-prefix.engine';
  import MessageNotice from './MessageNotice.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectInlineStyle } from './inline-style.dom';
  import { serializeInlineStyleLayers, type InlineStyleLayer } from './inline-style.engine';
  import { messageHolderKey } from './message.model.svelte.js';
  import { connectMessageSurface } from './message.dom';
  import type { MessageHolderProps } from './message.types';

  let {
    message,
    prefixCls: customizePrefixCls,
    top = 8,
    id,
    class: className = '',
    style
  }: MessageHolderProps = $props();
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('message', customizePrefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let prefixCss = $derived(getMessagePrefixCss(componentPrefix, rootPrefix));
  const componentTheme = useComponentTheme('Message');
  let anchor = $state<HTMLSpanElement>();
  let surface = $state<HTMLDivElement>();
  let runtime = $derived(message[messageHolderKey]);
  let notices = $derived(runtime.notices);
  let resolvedTop = $derived(
    typeof top === 'number'
      ? `${Number.isFinite(top) && top >= 0 ? top : 8}px`
      : top.trim() || '8px'
  );
  let rootLayers = $derived<readonly InlineStyleLayer[]>([
    componentTheme.style,
    style,
    [['--notification-top', resolvedTop]]
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
      && origin) return untrack(() => connectMessageSurface(node, origin, current.setVisible));
  });
</script>

<style>
  .ant-message-anchor { position: absolute; width: 0; height: 0; pointer-events: none; visibility: hidden; }
  [data-ant-message-root][data-ant-message-list] { position: fixed; inset: auto; top: calc(var(--notification-top) + var(--ant-svelte-notice-viewport-top, 0px) - var(--notification-margin-edge)); left: 0; right: auto; width: 100%; max-width: 100vw; height: auto; max-height: calc(100dvh - var(--notification-top) + var(--notification-margin-edge)); margin: 0; border: 0; background: transparent; transform: none; outline: none; }
  [data-ant-message-root]:not(:popover-open) { display: none; }
  [data-ant-message-content] { align-items: center; }
  [data-ant-message-root]::backdrop { pointer-events: none; background: transparent; }
</style>

<span bind:this={anchor} class="ant-message-anchor" aria-hidden="true" {@attach connectHost}></span>
{#key message}
  {#if notices.length}
    {#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`message-prefix:${componentPrefix}:${rootPrefix}`} />{/if}<div bind:this={surface}
      data-ant-message-root data-ant-message-list data-ant-message-top
      data-ant-message-prefix={componentPrefix} data-ant-message-root-prefix={rootPrefix} popover="manual" {id} dir={config.direction} class={[
        `${componentPrefix} ant-message-css-var ${componentPrefix}-list ${componentPrefix}-top`,
        componentTheme.className,
        config.direction === 'rtl' && `${componentPrefix}-rtl`,
        className
      ]} style={untrack(() => rootStyle)} {@attach connectRootStyle}>
      <div data-ant-message-content class={`${componentPrefix}-list-content`}>{#each notices as notice (notice.id)}<MessageNotice {notice} {message} prefixCls={componentPrefix} />{/each}</div>
    </div>
  {/if}
{/key}
