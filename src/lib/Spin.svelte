<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { createSpinModel, normalizeSpinDelay } from './spin.model.svelte.js';
  import { createSpinFocus } from './spin.dom';
  import { advanceSpinPercent } from './spin-percent.engine';
  import { resolveSpinIndicator } from './spin-indicator';
  import { getSpinPrefixCss } from './spin-prefix.engine';
  import SpinProgress from './SpinProgress.svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { ruRU } from './types';
  import type { SpinProps, SpinSemanticInfo, SpinSemanticSlots } from './spin.types';

  let {
    spinning = true,
    delay = 0,
    size,
    description,
    indicator,
    children,
    fullscreen = false,
    percent,
    prefixCls,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-hidden': ariaHidden,
    class: className = '',
    rootClassName,
    style,
    classNames,
    styles,
    nativeElement = $bindable(),
    ref = $bindable(),
    ...rest
  }: SpinProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Spin');
  // Выходной ref может сброситься при смене spread props; lifecycle использует свой DOM host.
  let host = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let mockPercent = $state(0);
  // Spread props могут инвалидировать getters без смены значения; таймеры сравнивают примитивы.
  let requestedSpinning = $derived(spinning);
  let requestedDelay = $derived(normalizeSpinDelay(delay));
  let isAuto = $derived(percent === 'auto');
  let request = $derived({ spinning: requestedSpinning, delay: requestedDelay });
  const model = createSpinModel(() => request);
  const focus = createSpinFocus();
  let visible = $derived(model.visible);
  let prefix = $derived(prefixCls || 'ant-spin');
  let prefixCss = $derived(getSpinPrefixCss(prefix));
  let resolvedSize = $derived(size ?? config.explicitComponentSize);
  let resolvedPercent = $derived(percent === 'auto' ? mockPercent : percent);
  let hasChildren = $derived(children !== undefined);
  let nested = $derived(hasChildren || fullscreen);
  let strings = $derived({ ...ruRU.spin, ...config.locale.spin });
  let hasDescription = $derived(
    typeof description === 'function' || Boolean(description)
  );
  let label = $derived(
    ariaLabel ?? (ariaLabelledby ? undefined
      : typeof description === 'string' && description
        ? description : strings.loadingText)
  );
  let announce = $derived(visible && !ariaHidden);
  let semanticInfo = $derived<SpinSemanticInfo>({
    props: {
      ...rest,
      id,
      spinning: visible,
      delay,
      size: resolvedSize,
      description: description,
      indicator,
      children,
      fullscreen,
      percent: resolvedPercent,
      prefixCls,
      class: className,
      rootClassName,
      style,
      classNames,
      styles,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      'aria-hidden': ariaHidden
    }
  });
  let resolvedIndicator = $derived(resolveSpinIndicator(semanticInfo.props, config.spin));
  let semantics = $derived.by(() => {
    const inheritedClasses = config.spin?.classNames;
    const inheritedStyles = config.spin?.styles;
    const contextClasses = typeof inheritedClasses === 'function'
      ? inheritedClasses(semanticInfo) : inheritedClasses;
    const contextStyles = typeof inheritedStyles === 'function'
      ? inheritedStyles(semanticInfo) : inheritedStyles;
    const localClasses = typeof classNames === 'function' ? classNames(semanticInfo) : classNames;
    const localStyles = typeof styles === 'function' ? styles(semanticInfo) : styles;
    const classes: SpinSemanticSlots = {};
    const slots: SpinSemanticSlots = {};

    for (const slot of [
      'root', 'section', 'indicator', 'description', 'container'
    ] as const) {
      classes[slot] = [contextClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      slots[slot] = [
        contextStyles?.[slot],
        slot === 'root' && config.spin?.style,
        localStyles?.[slot]
      ].filter(Boolean).join(';');
    }

    return { classes, styles: slots };
  });

  $effect(() => {
    const node = host;
    const current = request;
    if (!node) return;

    const view = node.ownerDocument.defaultView!;
    return untrack(() => model.connect(current, {
      schedule(callback, milliseconds) {
        const timer = view.setTimeout(callback, milliseconds);
        return () => view.clearTimeout(timer);
      }
    }));
  });

  $effect(() => {
    const node = host;
    const active = isAuto && visible;
    if (!node || !active) return;

    mockPercent = 0;
    const view = node.ownerDocument.defaultView!;
    const timer = view.setInterval(() => {
      mockPercent = advanceSpinPercent(mockPercent);
    }, 200);
    return () => view.clearInterval(timer);
  });

  $effect.pre(() => {
    const node = host;
    const container = content;
    const busy = spinning;
    if (node) untrack(() => focus.update(node, container, busy));
  });

  onMount(() => {
    nativeElement = host;
    ref = { nativeElement: host! };
    return () => {
      nativeElement = undefined;
      ref = undefined;
    };
  });
  onDestroy(() => focus.destroy());
</script>

<style>
  [data-ant-spin-root] { min-width: 0; max-width: 100%; }
  [data-ant-spin-root][hidden] { display: none; }
  [data-ant-spin-root]:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  [data-ant-spin-root] > [data-ant-spin-part="section"] { width: max-content; max-width: calc(100% - 24px); pointer-events: none; text-align: center; }
  [data-ant-spin-part="description"] { min-width: 0; max-width: 100%; overflow-wrap: anywhere; text-align: center; }
  [data-ant-spin-part="dot"], [data-ant-spin-part="holder"] { flex: none; }
  @media (prefers-reduced-motion: reduce) {
    [data-ant-spin-root] { transition: none; }
    [data-ant-spin-root] [data-ant-spin-part="dot"], [data-ant-spin-root] [data-ant-spin-part="item"] { animation: none; }
    [data-ant-spin-root] [data-ant-spin-part="item"] { opacity: 1; }
    [data-ant-spin-root] [data-ant-spin-part="container"], [data-ant-spin-root] [data-ant-spin-part="container"]::after,
    [data-ant-spin-root] [data-ant-spin-part="holder"] { transition: none; }
    [data-ant-spin-part="custom"] :global(*) { animation: none !important; transition: none !important; }
  }
</style>

{#snippet visual()}
  {#if resolvedIndicator}
    <span class={[`${prefix}-dot`, semantics.classes.indicator]}
      style={semantics.styles.indicator} aria-hidden="true" data-ant-spin-part="custom">
      {@render resolvedIndicator({ percent: resolvedPercent, prefixCls: prefix,
        class: [`${prefix}-dot`, semantics.classes.indicator].filter(Boolean).join(' '),
        style: semantics.styles.indicator })}
    </span>
  {:else}
    <span class={[`${prefix}-dot-holder`, semantics.classes.indicator,
      (resolvedPercent ?? 0) > 0 && `${prefix}-dot-holder-hidden`]}
      style={semantics.styles.indicator} data-ant-spin-part="holder" aria-hidden="true">
      <span class={`${prefix}-dot ${prefix}-dot-spin`} data-ant-spin-part="dot" aria-hidden="true">
        {#each [1, 2, 3, 4] as dot (dot)}<i class={`${prefix}-dot-item`} data-ant-spin-part="item"></i>{/each}
      </span>
    </span>
    <SpinProgress prefixCls={prefix} percent={resolvedPercent ?? 0} {label} />
  {/if}
  {#if hasDescription}
    <div class={[`${prefix}-description`, semantics.classes.description]}
      style={semantics.styles.description}
      data-ant-spin-part="description">{#if typeof description === 'function'}{@render description()}{:else if typeof description !== 'boolean'}{description}{/if}</div>
  {:else if description === 0}0{/if}
{/snippet}

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`spin-prefix:${prefix}`} />{/if}<!-- svelte-ignore a11y_no_noninteractive_tabindex (Отрицательный tabindex временно паркует фокус вне inert children.) --><div
  bind:this={host} {id} data-ant-spin-root
  data-ant-spin-prefix={prefixCss ? prefix : undefined}
  role={ariaHidden ? undefined : hasChildren ? 'group' : announce ? 'status' : undefined}
  aria-live={!hasChildren && announce ? 'polite' : undefined}
  aria-atomic={!hasChildren && announce || undefined}
  aria-label={hasChildren || visible ? label : undefined}
  aria-labelledby={hasChildren || visible ? ariaLabelledby : undefined}
  aria-describedby={ariaDescribedby}
  aria-hidden={ariaHidden || !hasChildren && !visible || undefined}
  tabindex={hasChildren ? -1 : undefined} hidden={!nested && !visible}
  dir={config.direction} class={[
    prefix, 'ant-spin-css-var', componentTheme.className,
    visible && `${prefix}-spinning`, fullscreen && `${prefix}-fullscreen`,
    resolvedSize === 'small' && `${prefix}-sm`, resolvedSize === 'large' && `${prefix}-lg`,
    config.direction === 'rtl' && `${prefix}-rtl`, rootClassName, semantics.classes.root,
    !nested && [`${prefix}-section`, semantics.classes.section],
    config.spin?.class, className
  ]} style={[componentTheme.style, semantics.styles.root, !nested && semantics.styles.section,
    style].filter(Boolean).join(';') || undefined} {...rest}>
  {#if visible}
    {#if nested}
      <div class={[`${prefix}-section`, semantics.classes.section]}
        style={semantics.styles.section} data-ant-spin-part="section"
        role={hasChildren && announce ? 'status' : undefined}
        aria-live={hasChildren && announce ? 'polite' : undefined}
        aria-atomic={hasChildren && announce || undefined}
        aria-label={hasChildren ? typeof description === 'string' && description
          ? description : strings.loadingText : undefined}>{@render visual()}</div>
    {:else}{@render visual()}{/if}
  {/if}
  {#if hasChildren}<div bind:this={content} class={[`${prefix}-container`, semantics.classes.container]}
    style={semantics.styles.container} data-ant-spin-part="container" inert={spinning}
    aria-busy={spinning}>{#if typeof children === 'function'}{@render children()}{:else if typeof children !== 'boolean'}{children}{/if}</div>{/if}
</div>
