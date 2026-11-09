<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { inheritedComponentThemeStyle } from './theme-component-style.engine';
  import { notificationHolderKey, type NotificationNotice } from './notification.model.svelte.js';
  import { animateNotice, focusAfterNotice } from './notice.dom';
  import type { NotificationInstance } from './notification.types';

  let {
    notice,
    notification,
    prefixCls
  }: {
    notice: NotificationNotice;
    notification: NotificationInstance;
    prefixCls: string;
  } = $props();
  const id = untrack(() => notice.id);
  const runtime = untrack(() => notification[notificationHolderKey]);
  const config = useConfig();
  const designTheme = useDesignTokenContext();
  let inheritedStyle = $derived(designTheme.enabled && designTheme.state.prefix !== 'ant'
    ? inheritedComponentThemeStyle('Notification', designTheme.state.token, designTheme.state.prefix)
    : undefined);
  let rootStyle = $derived([inheritedStyle, notice.style].filter(Boolean).join(';') || undefined);
  const identity = $props.id();
  const icons = {
    success: 'check-circle-filled',
    info: 'info-circle-filled',
    warning: 'exclamation-circle-filled',
    error: 'close-circle-filled'
  } as const;
  let node = $state<HTMLDivElement>();
  let present = $state(true);
  let entered = false;
  let active = true;
  let disposeMotion: (() => void) | undefined;
  let hasTitle = $derived(typeof notice.title === 'function' || Boolean(notice.title));
  let hasDescription = $derived(
    typeof notice.description === 'function' || Boolean(notice.description)
  );
  let closeConfig = $derived(typeof notice.closable === 'object' ? notice.closable : undefined);
  let closeIcon = $derived(
    closeConfig?.closeIcon !== undefined ? closeConfig.closeIcon : notice.closeIcon
  );
  let closable = $derived(notice.closable !== false && closeIcon !== false && closeIcon !== null);

  function mounted() {
    runtime.mounted(id);
  }
  function handleClose() {
    if (closable && !closeConfig?.disabled)
      runtime.close(id);
  }
  function handleFocusOut(event: FocusEvent) {
    if (!node?.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null))
      runtime.focus(id, false);
  }

  $effect.pre(() => {
    const root = node;
    const closing = notice.closing;
    // Снимок фокуса нужен до inert и до возможного удаления action snippet.
    if (root)
      untrack(() => {
        const ownedFocus = root.contains(root.ownerDocument.activeElement);
        if (closing)
          focusAfterNotice(root, ownedFocus);
        else void tick().then(() => {
          if (!active || !root.isConnected) return;
          if (ownedFocus && !root.contains(root.ownerDocument.activeElement))
            focusAfterNotice(root, true);
          runtime.focus(id, root.contains(root.ownerDocument.activeElement));
        });
      });
  });

  $effect(() => {
    const root = node;
    const current = notice;
    const visible = runtime.visible;
    if (!root || !present) return;

    untrack(() => {
      const shift = current.placement.endsWith('Left')
        ? 'translateX(-64px)'
        : current.placement.endsWith('Right')
          ? 'translateX(64px)'
          : current.placement === 'bottom' ? 'translateY(64px)' : 'translateY(-64px)';
      if (current.closing) {
        const style = root.ownerDocument.defaultView!.getComputedStyle(root);
        const from = { opacity: style.opacity, transform: style.transform };
        disposeMotion?.();
        const finish = () => {
          present = false;
          void tick().then(() => {
            if (active)
              runtime.complete(id, current.version);
          });
        };
        if (!visible)
          finish(); else disposeMotion = animateNotice(root, true, from, finish, shift);
      } else if (visible && !entered) {
        entered = true;
        disposeMotion = animateNotice(root, false, undefined, () => { }, shift);
      }
    });
  });

  onDestroy(() => {
    active = false;
    disposeMotion?.();
    if (node)
      focusAfterNotice(node, node.contains(node.ownerDocument.activeElement));
    runtime.hover(id, false);
    runtime.focus(id, false);
  });
</script>

<style>
  :global([data-ant-notification-root][data-ant-notification-list]) > :global([data-ant-notification-content]) > [data-ant-notification-notice] { position: relative; inset: auto; max-width: 100%; transform: none; transition: none; }
  [data-ant-notification-notice-title], [data-ant-notification-notice-description] { min-width: 0; overflow-wrap: anywhere; }
  [data-ant-notification-notice-icon] { display: inline-flex; }
  /* Absolute notice в Source создаёт BFC; native relative notice сохраняет float через flow-root. */
  .notification-source-theme { display: flow-root; }
  .notification-source-theme [data-ant-notification-notice-icon] { display: block; }
  .notification-source-theme [data-ant-notification-notice-actions] { display: block; }
  /* Общий markup сохраняет controls при смене темы; grid повторяет прежний legacy layout. */
  [data-ant-notification-notice]:not(.notification-source-theme) { display: grid; grid-template-columns: minmax(0, 1fr); row-gap: var(--ant-margin-xs); }
  [data-ant-notification-notice]:not(.notification-source-theme).notification-with-icon { grid-template-columns: max-content minmax(0, 1fr); column-gap: var(--ant-margin-sm); }
  [data-ant-notification-notice]:not(.notification-source-theme) [data-ant-notification-notice-wrapper] { display: contents; }
  [data-ant-notification-notice]:not(.notification-source-theme) :is([data-ant-notification-notice-section], [data-ant-notification-notice-title], [data-ant-notification-notice-description]) { grid-column: -2 / -1; grid-row: 1; }
  [data-ant-notification-notice]:not(.notification-source-theme) [data-ant-notification-notice-icon] { grid-column: 1; grid-row: 1; align-self: start; }
  [data-ant-notification-notice]:not(.notification-source-theme):has(> [data-ant-notification-notice-actions]) [data-ant-notification-notice-icon] { grid-row: 1 / span 2; }
  [data-ant-notification-notice]:not(.notification-source-theme):not(.notification-with-text) { row-gap: 0; }
  [data-ant-notification-notice]:not(.notification-source-theme) > [data-ant-notification-notice-actions] { grid-column: -2 / -1; grid-row: 2; float: none; }
  [data-ant-notification-notice-close] { min-width: 24px; min-height: 24px; padding: 0; cursor: pointer; }
  [data-ant-notification-notice-close]:disabled { cursor: default; }
  [data-ant-notification-notice-actions] { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--ant-margin-xs); max-width: 100%; }
  @media (prefers-reduced-motion: reduce) { [data-ant-notification-notice-close] { transition: none; } }
</style>

{#snippet titleContent()}
  <div data-ant-notification-notice-title class={`${prefixCls}-notice-title`} id={`${identity}-title`}>{#if typeof notice.title === 'function'}{@render notice.title()}{:else}{notice.title}{/if}</div>
{/snippet}
{#snippet descriptionContent()}
  <div data-ant-notification-notice-description class={`${prefixCls}-notice-description`} id={`${identity}-description`}>{#if typeof notice.description === 'function'}{@render notice.description()}{:else}{notice.description}{/if}</div>
{/snippet}
{#snippet textContent()}
  {#if hasTitle && hasDescription}
    <div data-ant-notification-notice-section class={`${prefixCls}-notice-section`}>
      {@render titleContent()}
      {@render descriptionContent()}
    </div>
  {:else if hasTitle}{@render titleContent()}
  {:else if hasDescription}{@render descriptionContent()}{/if}
{/snippet}

{#if present}
  <div data-ant-notification-notice bind:this={node} {@attach mounted} role={notice.role} aria-atomic="true" aria-label={notice['aria-label']} aria-labelledby={notice['aria-labelledby']
      ?? (notice['aria-label']
        ? undefined
        : hasTitle ? `${identity}-title` : undefined)} aria-describedby={notice['aria-describedby']
            ?? (hasDescription
              ? `${identity}-description`
              : undefined)} aria-hidden={notice.closing || undefined} inert={notice.closing} class={[
            `${prefixCls}-notice`,
            designTheme.enabled && 'notification-source-theme',
            (notice.icon || notice.type) && 'notification-with-icon',
            (hasTitle || hasDescription) && 'notification-with-text',
            notice.type && `${prefixCls}-notice-${notice.type}`,
            closable && `${prefixCls}-notice-closable`,
            notice.class
          ]} style={rootStyle} onpointerenter={(event) => {
        if (event.pointerType !== 'touch')
          runtime.hover(id, true);
      }} onpointerleave={() => runtime.hover(id, false)} onfocusin={() => runtime.focus(id, true)} onfocusout={handleFocusOut}>
    {#if notice.icon || notice.type}
      <div data-ant-notification-notice-wrapper class={`${prefixCls}-notice-wrapper`}>
        <span data-ant-notification-notice-icon class={[
          `${prefixCls}-notice-icon`,
          notice.type && (!designTheme.enabled || !notice.icon)
            && `${prefixCls}-notice-icon-${notice.type}`
        ]} aria-hidden="true">{#if notice.icon}{@render notice.icon()}{:else if notice.type}<Icon name={icons[notice.type]} />{/if}</span>
        {@render textContent()}
      </div>
    {:else}{@render textContent()}{/if}
    {#if notice.actions}<div data-ant-notification-notice-actions class={`${prefixCls}-notice-actions`}>{@render notice.actions()}</div>{/if}
    {#if closable}<button type="button" data-ant-notification-notice-close class={`${prefixCls}-notice-close`} disabled={notice.closing || closeConfig?.disabled} aria-label={closeConfig?.['aria-label'] ?? config.locale.closeText} aria-labelledby={closeConfig?.['aria-labelledby']} aria-describedby={closeConfig?.['aria-describedby']} onclick={handleClose}><span aria-hidden="true">{#if typeof closeIcon === 'function'}{@render closeIcon()}{:else if typeof closeIcon === 'string'}{closeIcon}{:else}<Icon name="close" />{/if}</span></button>{/if}
  </div>
{/if}
