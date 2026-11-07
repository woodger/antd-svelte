<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { createBackTopRuntime } from './float-button-back-top.dom';
  import { createFloatButtonMotion } from './float-button-motion.dom';
  import { getBackTopStyle } from './back-top-style.engine';
  import FloatButtonIcon from './FloatButtonIcon.svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { BackTopProps } from './back-top.types';

  let {
    children,
    visibilityHeight = 400,
    target,
    duration = 450,
    prefixCls,
    class: className = '',
    rootClassName,
    style,
    dir,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    hidden,
    inert,
    onclick,
    onClick,
    nativeElement = $bindable(),
    ...attributes
  }: BackTopProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('BackTop');
  const designTokens = useDesignTokenContext();
  let prefix = $derived(prefixCls || 'ant-back-top');
  let sheet = $derived(getBackTopStyle(prefix, designTokens.state.token));
  let visible = $state(untrack(() => visibilityHeight === 0));
  let present = $state(untrack(() => visibilityHeight === 0));
  let child = $state.raw<Element>();
  let runtime = $state.raw<ReturnType<typeof createBackTopRuntime>>();
  let motion = $state.raw<ReturnType<typeof createFloatButtonMotion>>();
  let motionTarget: boolean | undefined;
  const defaultTarget = () => nativeElement?.ownerDocument ?? window;
  let getTarget = $derived(target ?? defaultTarget);

  $effect(() => {
    const view = nativeElement?.ownerDocument.defaultView;
    if (!view) return;
    const controller = createBackTopRuntime(view, state => { visible = state.visible; });
    runtime = controller;

    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });
  $effect(() => {
    getTarget();
    runtime?.configure({ getTarget, visibilityHeight, showProgress: false });
  });
  $effect(() => {
    if (visible) present = true;
  });
  $effect(() => {
    const node = nativeElement;
    const view = node?.ownerDocument.defaultView;
    if (!node || !view) return;
    const sync = () => {
      // Snippet может заменить свой единственный корень, не меняя функцию children.
      child = node.children.length === 1 ? node.firstElementChild ?? undefined : undefined;
    };
    sync();
    const observer = new view.MutationObserver(sync);
    observer.observe(node, { childList: true });

    return () => {
      observer.disconnect();
      child = undefined;
    };
  });
  $effect(() => {
    if (!child) return;
    const controller = createFloatButtonMotion(child, false, () => { present = false; },
      motionTarget);
    motion = controller;

    return () => {
      controller.destroy();
      motion = undefined;
    };
  });
  $effect(() => {
    if (!present) return;
    if (motion) {
      motion.sync(visible);
      motionTarget = visible;
    } else if (!visible && !child) {
      present = false;
      motionTarget = false;
    }
  });
  $effect(() => {
    const node = nativeElement;
    if (!node) return;
    // Контейнер делегирует click настоящей кнопки или пользовательского control.
    const click = (event: MouseEvent) => {
      runtime?.scrollToTop(duration);
      (onclick ?? onClick)?.(event);
    };
    node.addEventListener('click', click);

    return () => node.removeEventListener('click', click);
  });
</script>

<style>
  button {
    appearance: none;
    display: block;
    border: 0;
    padding: 0;
    background: none;
    font: inherit;
    cursor: inherit;
  }
  button:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .icon { display: block; }
</style>

<ThemeScopeStyle css={sheet.css} scope={sheet.scope} />
<div {...attributes} bind:this={nativeElement} dir={dir ?? config.direction}
  class={[
    'ant-back-top-css-var', sheet.scope, componentTheme.className, prefix,
    config.direction === 'rtl' && `${prefix}-rtl`, className, rootClassName
  ]} style={[componentTheme.style, style].filter(Boolean).join(';') || undefined}
  inert={!visible || inert} aria-hidden={!visible ? true : ariaHidden}
  aria-label={ariaLabel} hidden={!present || hidden}
>{#if present}{#if children}{@render children()}{:else}<button type="button"
        class={`${prefix}-content`} aria-label={ariaLabel ?? config.locale.global?.backToTop
          ?? 'Back to top'} aria-describedby={attributes['aria-describedby']}
        aria-labelledby={attributes['aria-labelledby']}><span class={[`${prefix}-icon`, 'icon']}
          aria-hidden="true"><FloatButtonIcon name="vertical-align-top" /></span></button>{/if}{/if}</div>
