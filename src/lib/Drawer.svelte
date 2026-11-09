<script lang="ts">
  import NoCompactStyle from './NoCompactStyle.svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getDrawerPrefixCss } from './drawer-prefix.engine';
  import { onDestroy, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { useWatermarkPanel } from './watermark-context';
  import { createDrawerDialog } from './drawer.dom';
  import { getDrawerSize } from './drawer.engine';
  import { createDialogContainer } from './dialog-container.model.svelte.js';
  import type { DrawerProps } from './drawer.types';

  let {
    prefixCls: customizePrefixCls,
    open = $bindable(false),
    title,
    children,
    extra,
    footer,
    placement = 'right',
    size = 'default',
    closable = true,
    keyboard = true,
    mask,
    forceRender = false,
    destroyOnHidden = false,
    getContainer,
    onClose,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style
  }: DrawerProps = $props();

  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('drawer', customizePrefixCls));
  let prefixCss = $derived(getDrawerPrefixCss(componentPrefix));
  const componentTheme = useComponentTheme('Drawer');
  const designTheme = useDesignTokenContext();
  const watermarkPanel = useWatermarkPanel();
  const generatedId = $props.id();
  let dialog = $state<HTMLDialogElement>();
  let mounted = $state(false);
  // Это фаза фактической DOM-анимации, а не копия запрошенного open.
  let closing = $state(false);
  let runtime = $state.raw<ReturnType<typeof createDrawerDialog>>();
  let backdropPointer: number | undefined;
  let active = true;
  let rootId = $derived(id ?? `ant-drawer-${generatedId}`);
  let titleId = $derived(`${rootId}-title`);
  let renderContent = $derived(open || closing || forceRender || mounted && !destroyOnHidden);
  let rootStyle = $derived([componentTheme.style, style].filter(Boolean).join(';') || undefined);
  const container = createDialogContainer(() => ({
    component: 'drawer',
    getContainer,
    getPopupContainer: config.getPopupContainer,
    enabled: !destroyOnHidden || open || closing || forceRender,
    style: rootStyle,
    onPointerDown: event => {
      backdropPointer = event.button === 0 && isBackdrop(event) ? event.pointerId : undefined;
    },
    onPointerUp: handlePointerUp,
    onPointerCancel: () => { backdropPointer = undefined; }
  }));

  function connectRuntime(node: HTMLDialogElement) {
    closing = false;
    const current = createDrawerDialog(node, value => { closing = value; });
    runtime = current;
    return () => {
      current.destroy();
      if (runtime === current) runtime = undefined;
    };
  }

  // Содержимое остаётся смонтированным до завершения ухода панели.
  $effect.pre(() => {
    const node = dialog;
    const requested = open;
    const side = placement;
    if (node && !requested)
      untrack(() => runtime?.sync(false, side));
  });

  $effect(() => {
    const node = dialog;
    const requested = open;
    const side = placement;
    const current = runtime;
    if (!node || !current || !container.connected || !node.isConnected) return;

    untrack(() => {
      current.sync(requested, side);
    });
  });

  onDestroy(() => {
    active = false;
  });

  function rememberContent() {
    mounted = true;
    return () => {
      mounted = false;
    };
  }

  function requestClose(event: Event) {
    if (!active || !open) return;

    backdropPointer = undefined;
    open = false;
    onClose?.(event);
  }

  function handleCancel(event: Event) {
    event.preventDefault();
    if (keyboard)
      requestClose(event);
  }

  function isBackdrop(event: PointerEvent) {
    return event.target === dialog
      || event.target instanceof HTMLElement
      && event.target.hasAttribute('data-ant-drawer-mask')
      && event.target.parentElement === dialog;
  }

  function handlePointerUp(event: PointerEvent) {
    const dismiss = event.pointerId === backdropPointer && isBackdrop(event);
    backdropPointer = undefined;
    if (mask?.closable !== false && dismiss)
      requestClose(event);
  }

  function handleClose(event: Event) {
    if (!active || event.currentTarget !== dialog || dialog?.open) return;

    runtime?.nativeClosed();
    open = false;
  }
</script>

<style>
  :global(html:has(dialog.ant-svelte-drawer[open])) { overflow: hidden; }
  .ant-svelte-drawer { width: 100%; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; overflow: hidden; background: transparent; pointer-events: auto; outline: none; }
  .ant-svelte-drawer:not([open]) { display: none; }
  .ant-svelte-drawer::backdrop { background: transparent; }
  .ant-svelte-drawer > [data-ant-drawer-content-wrapper] { max-width: 100%; max-height: 100%; transition: none; }
  [data-ant-drawer-placement="left"] > [data-ant-drawer-content-wrapper], [data-ant-drawer-placement="right"] > [data-ant-drawer-content-wrapper] { width: min(var(--ant-svelte-drawer-size), 100%); height: 100%; }
  [data-ant-drawer-placement="top"] > [data-ant-drawer-content-wrapper], [data-ant-drawer-placement="bottom"] > [data-ant-drawer-content-wrapper] { width: 100%; height: min(var(--ant-svelte-drawer-size), 100%); }
  [data-ant-drawer-header] { gap: var(--ant-margin-xs); }
  [data-ant-drawer-title], [data-ant-drawer-extra], [data-ant-drawer-body], [data-ant-drawer-footer] { min-width: 0; overflow-wrap: anywhere; }
  [data-ant-drawer-title] { color: var(--ant-color-text-heading); }
  .drawer-source-theme [data-ant-drawer-title] { color: inherit; }
  [data-ant-drawer-extra] { max-width: 50%; }
  [data-ant-drawer-section] { min-height: 0; }
  @media (prefers-reduced-motion: reduce) { [data-ant-drawer-close] { transition: none; } }
</style>

<!-- Keyed range содержит только переносимый dialog; head-style anchors остаются снаружи. -->
<NoCompactStyle>
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`drawer-prefix:${componentPrefix}`} />{/if}{#key container.key}<dialog data-ant-drawer-prefix={componentPrefix} data-ant-drawer-placement={placement} bind:this={dialog} id={rootId} class={[
    `${componentPrefix} ant-drawer-css-var ant-svelte-drawer`,
    componentTheme.className,
    designTheme.enabled && 'drawer-source-theme',
    `${componentPrefix}-${placement}`,
    config.direction === 'rtl' && `${componentPrefix}-rtl`,
    className
  ]} style={rootStyle} style:--ant-svelte-drawer-size={getDrawerSize(size)} dir={config.direction} aria-modal="true" aria-label={ariaLabel} aria-labelledby={ariaLabelledby
      ?? (ariaLabel === undefined && title !== undefined
        ? titleId
        : undefined)} aria-describedby={ariaDescribedby} oncancel={handleCancel} onclose={handleClose}
    {@attach container.attach} {@attach connectRuntime}>
  <div data-ant-drawer-mask class={[`${componentPrefix}-mask`, mask?.blur && `${componentPrefix}-mask-blur`]} aria-hidden="true"></div>
  <div data-ant-drawer-content-wrapper class={`${componentPrefix}-content-wrapper`}>
    {#if renderContent}
      <div data-ant-drawer-section class={`${componentPrefix}-section`} {@attach rememberContent} {@attach watermarkPanel}>
        {#if title !== undefined || closable || extra}
          <div data-ant-drawer-header class={`${componentPrefix}-header`}>
            <div data-ant-drawer-header-title class={`${componentPrefix}-header-title`}>
              {#if closable}<button type="button" data-ant-drawer-close class={`${componentPrefix}-close`} aria-label={config.locale.closeText} onclick={requestClose}><Icon name="close" /></button>{/if}
              {#if title !== undefined}<h2 id={titleId} data-ant-drawer-title class={`${componentPrefix}-title`}>{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</h2>{/if}
            </div>
            {#if extra}<div data-ant-drawer-extra class={`${componentPrefix}-extra`}>{@render extra()}</div>{/if}
          </div>
        {/if}
        <div data-ant-drawer-body class={`${componentPrefix}-body`}>{@render children?.()}</div>
        {#if footer}<div data-ant-drawer-footer class={`${componentPrefix}-footer`}>{@render footer()}</div>{/if}
      </div>
    {/if}
  </div>
</dialog>
{/key}
</NoCompactStyle>
