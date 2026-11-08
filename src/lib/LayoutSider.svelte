<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { provideSider, useLayout } from './layout-context';
  import { layoutSiderWidth } from './layout.engine';
  import { connectSiderBreakpoint } from './layout.dom';
  import { getLayoutPrefixCss } from './layout-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { connectFeedbackFocus } from './feedback.dom';
  import { focusAfterNotice } from './notice.dom';
  import Icon from './Icon.svelte';
  import { ruRU } from './types';
  import type { LayoutCollapseType, LayoutSiderProps } from './layout.types';

  let {
    children,
    prefixCls,
    collapsed = $bindable<boolean | undefined>(),
    defaultCollapsed = false,
    collapsible = false,
    reverseArrow = false,
    width = 200,
    collapsedWidth = 80,
    breakpoint,
    theme = 'dark',
    trigger,
    zeroWidthTriggerStyle,
    expandLabel,
    collapseLabel,
    onCollapse,
    onBreakpoint,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: LayoutSiderProps = $props();
  const config = useConfig();
  let componentPrefix = $derived(prefixCls || 'ant-layout-sider');
  let prefixCss = $derived(getLayoutPrefixCss(componentPrefix, 'sider'));
  const componentTheme = useComponentTheme('Layout');
  const layout = useLayout();
  const id = $props.id();
  const initial = untrack(() => defaultCollapsed);
  let selected = $derived(collapsed ?? initial);
  let below = $state(false);
  let body = $state<HTMLDivElement>();
  let button = $state<HTMLButtonElement>();
  let active = true;
  let actualWidth = $derived(layoutSiderWidth(selected ? collapsedWidth : width));
  let zero = $derived(Number.parseFloat(actualWidth) === 0);
  let zeroTrigger = $derived(Number.parseFloat(String(collapsedWidth || 0)) === 0);
  let showTrigger = $derived(trigger !== null && (collapsible || below && zeroTrigger));
  let reverseIcon = $derived((config.direction === 'rtl') === !reverseArrow);
  let strings = $derived({ ...ruRU.layout, ...config.locale.layout });
  let info = $derived(
    {
      props: {
        ...rest,
        children,
        prefixCls,
        collapsed: selected,
        defaultCollapsed,
        collapsible,
        reverseArrow,
        width,
        collapsedWidth,
        breakpoint,
        theme,
        trigger,
        zeroWidthTriggerStyle,
        expandLabel,
        collapseLabel,
        onCollapse,
        onBreakpoint,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let classes = $derived(typeof classNames === 'function' ? classNames(info) : classNames ?? {});
  let slots = $derived(typeof styles === 'function' ? styles(info) : styles ?? {});
  provideSider({
    get collapsed() {
      return selected;
    }
  });
  onDestroy(() => {
    active = false;
  });
  $effect(() => untrack(() => layout?.register(id)));
  $effect(() => {
    // Внутренний DOM не зависит от обновления публичного ref родителем.
    const node = body?.parentElement;
    if (node) return connectFeedbackFocus(node);
  });
  $effect.pre(() => {
    const element = body;
    if (!zero || !element?.contains(element.ownerDocument.activeElement)) return;
    const host = element.parentElement;
    const document = element.ownerDocument;
    void tick().then(() => {
      if (!active || !host?.isConnected) return;
      if (document.activeElement !== document.body
        && !element.contains(document.activeElement)) return;
      if (button?.getClientRects().length)
        button.focus({ preventScroll: true }); else focusAfterNotice(host, true);
    });
  });
  $effect(() => {
    const key = breakpoint;
    if (!key) return;
    return untrack(() => connectSiderBreakpoint(window, key, broken => {
      const previous = selected;
      below = broken;
      onBreakpoint?.(broken);
      if (previous !== broken)
        collapse(broken, 'responsive');
    }));
  });

  function collapse(next: boolean, source: LayoutCollapseType) {
    if (!active) return;
    collapsed = next;
    onCollapse?.(next, source);
  }
</script>

<style>
  button { border: 0; padding: 0; font: inherit; }
  button:focus-visible, [data-ant-layout-sider]:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -2px; }
  svg { width: 1em; height: 1em; }
  [data-ant-layout-compact] [data-ant-layout-zero-trigger] { font-size: 16px; }
  @media (prefers-reduced-motion: reduce) { [data-ant-layout-sider], button, button::after { transition: none; } }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`layout-sider-prefix:${componentPrefix}`} />{/if}
<aside {...rest} bind:this={nativeElement} dir={config.direction} data-ant-layout-sider=""
  data-ant-layout-prefix={prefixCss ? 'sider' : undefined}
  data-ant-layout-compact={config.theme.compact ? '' : undefined}
  class={[
      componentPrefix, 'ant-layout-css-var',
      componentTheme.className,
      `${componentPrefix}-${theme}`,
      config.theme.compact && `${componentPrefix}-compact`,
      selected && `${componentPrefix}-collapsed`,
      collapsible && trigger !== null && !zeroTrigger && `${componentPrefix}-has-trigger`,
      below && `${componentPrefix}-below`,
      zero && `${componentPrefix}-zero-width`,
      className,
      rootClassName,
      classes.root
    ]}
  style={[
      componentTheme.style,
      slots.root,
      style,
      `flex:0 0 ${actualWidth};max-width:${actualWidth};min-width:${actualWidth};width:${actualWidth}`
    ].filter(
      Boolean
    ).join(
      ';'
    )}>
  <div id={`ant-layout-sider-body-${id}`} bind:this={body} class={[`${componentPrefix}-children`, classes.body]} style={slots.body} inert={zero || undefined}>{@render children?.()}</div>
  {#if showTrigger}
    <button bind:this={button} type="button" aria-controls={`ant-layout-sider-body-${id}`} aria-expanded={!selected} aria-label={selected
        ? expandLabel ?? strings.expand
        : collapseLabel ?? strings.collapse}
      data-ant-layout-zero-trigger={zeroTrigger ? '' : undefined}
      class={zeroTrigger
          ? `${componentPrefix}-zero-width-trigger ${componentPrefix}-zero-width-trigger-${reverseArrow
            ? 'right'
            : 'left'}`
          : `${componentPrefix}-trigger`}
      style={zeroTrigger ? zeroWidthTriggerStyle : `width:${actualWidth}`} onclick={() => collapse(!selected, 'clickTrigger')}>
      {#if typeof trigger === 'function'}{@render trigger()}{:else if trigger}{trigger}
      {:else if zeroTrigger}<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16" /></svg>
      {:else}<Icon name={selected
          ? reverseIcon ? 'left' : 'right'
          : reverseIcon ? 'right' : 'left'} />{/if}
    </button>
  {/if}
</aside>
