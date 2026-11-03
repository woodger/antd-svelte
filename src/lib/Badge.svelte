<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useToken } from './theme-context.svelte';
  import { presetColors } from './theme-token.types';
  import { createBadgeZoom, type BadgeZoomState } from './badge-zoom.dom';
  import { connectBadgeStyle } from './badge-style.dom';
  import {
    getBadgeStyleValue, serializeBadgeStyleLayers, type BadgeStyleLayer
  } from './badge-style.engine';
  import { getBadgeState, normalizeBadgeOffset } from './badge.engine';
  import { ruRU } from './types';
  import type { BadgeContext, BadgeCountContext, BadgeProps, BadgeSemantic } from './badge.types';
  import BadgeNumber from './BadgeNumber.svelte';

  let { nativeElement = $bindable(), ...props }: BadgeProps = $props();
  let {
    count,
    overflowCount = 99,
    showZero = false,
    dot = false,
    status,
    color,
    text,
    size = 'medium',
    offset,
    title,
    children,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    dir: elementDirection,
    role,
    onClick,
    onclick,
    class: className = '',
    style,
    rootClassName,
    classNames,
    styles,
    ...rest
  } = $derived(props);
  const config = useConfig();
  const componentTheme = useComponentTheme('Badge');
  const token = useToken();
  let indicator = $state<HTMLElement>();
  let zoom = $state.raw<BadgeZoomState>({ rendered: false });
  const generatedId = $props.id();
  let rootId = $derived(id ?? `ant-badge-${generatedId}`);
  let badgeState = $derived(
    getBadgeState(
      { count, overflowCount, showZero, dot, status, color, text, hasChildren: Boolean(children) }
    )
  );
  let position = $derived(normalizeBadgeOffset(offset));
  let sourceOffset = $derived(offset?.some(value => typeof value === 'string') ?? false);
  let offsetLayer = $derived<BadgeStyleLayer>(position
    ? [
      ['margin-top', typeof position[1] === 'number' ? `${position[1]}px` : position[1]],
      ['inset-inline-end', `${-position[0]}px`]
    ]
    : undefined);
  let info = $derived({ props: { ...props, overflowCount, size, dot, showZero } });
  const resolve = (value: BadgeSemantic | undefined) =>
    (typeof value === 'function' ? value(info) : value) ?? {};
  let contextClasses = $derived(resolve(config.badge?.classNames));
  let localClasses = $derived(resolve(classNames));
  let contextStyles = $derived(resolve(config.badge?.styles));
  let localStyles = $derived(resolve(styles));
  let rootLayers = $derived([
    componentTheme.style,
    badgeState.statusStandalone ? offsetLayer : undefined,
    contextStyles.root,
    badgeState.statusStandalone ? config.badge?.style : undefined,
    localStyles.root,
    style
  ]);
  let rootStyle = $derived(serializeBadgeStyleLayers(rootLayers));
  let indicatorLayers = $derived([
    badgeState.statusStandalone ? undefined : offsetLayer,
    contextStyles.indicator,
    badgeState.statusStandalone ? undefined : config.badge?.style,
    localStyles.indicator
  ]);
  let isPreset = $derived(presetColors.some(preset => preset === color));
  let colorOverrides = $derived<readonly (readonly [string, string])[]>(color && !isPreset
    ? badgeState.statusStandalone ? [['color', color], ['background', color]]
      : [['background', color]] : []);
  let border = $derived(!badgeState.statusStandalone
    ? getBadgeStyleValue(indicatorLayers, 'border-color') : undefined);
  let indicatorStyle = $derived(serializeBadgeStyleLayers([
    ...indicatorLayers,
    ...colorOverrides.map(([property, value]) => `${property}:${value}`),
    border && `box-shadow:0 0 0 1px ${border} inset`
  ]));
  let statusTextColor = $derived(badgeState.statusStandalone ? getBadgeStyleValue([
    contextStyles.root, config.badge?.style, localStyles.root
  ], 'color') : undefined);
  let strings = $derived({ ...ruRU.badge, ...config.locale.badge });
  let customCount = $derived(typeof count === 'function' ? count : undefined);
  let current = $derived({
    custom: customCount,
    value: badgeState.displayValue,
    display: badgeState.display,
    dot: badgeState.showAsDot,
    title: badgeState.titleCount
  });
  let cached = $state.raw(untrack(() => current));
  let displayed = $derived(badgeState.hidden ? cached : current);
  let wanted = $derived(!badgeState.hidden && !badgeState.statusStandalone);
  let renderCounter = $derived(wanted || zoom.rendered);

  $effect.pre(() => {
    if (!badgeState.hidden) cached = current;
  });

  // Новый API следует source layout; прежние числовые DOM/spacing сохраняются.
  let sourceCount = $derived(typeof count === 'string' || typeof count === 'boolean'
    || Boolean(customCount || config.badge || classNames || styles || rootClassName)
    || color !== undefined && !isPreset || sourceOffset || size === 'default'
    || typeof text === 'number' || typeof text === 'boolean' || text === null);
  let descriptionId = $derived(
    badgeState.visible && (!badgeState.customCount || badgeState.statusStandalone)
      ? `${rootId}-description` : undefined
  );
  let context = $derived<BadgeContext>({ count: badgeState.count, descriptionId });
  let countContext = $derived<BadgeCountContext>({
    class: ['ant-scroll-number-custom-component', zoom.className].filter(Boolean).join(' '),
    style: serializeBadgeStyleLayers([
      offsetLayer,
      config.badge?.style,
      style
    ])
  });
  let description = $derived(
    !badgeState.statusStandalone && badgeState.descriptionCount !== undefined
      ? `${strings.count}: ${badgeState.descriptionCount}`
      : status ? strings[status] : strings.dot
  );
  let nativeTitle = $derived(
    title === false || title === null
      ? undefined
      : title
      ?? (badgeState.visible && !badgeState.statusStandalone && badgeState.titleCount !== undefined
        ? String(badgeState.titleCount)
        : undefined)
  );
  let indicatorTitle = $derived(title === false || title === null ? undefined
    : title ?? (displayed.title !== undefined ? String(displayed.title) : undefined));

  function connectRootStyle(node: HTMLSpanElement) {
    const update = connectBadgeStyle(node);
    $effect(() => update(rootLayers));
  }

  function connectIndicatorStyle(node: HTMLElement) {
    const update = connectBadgeStyle(node);
    $effect(() => update(indicatorLayers, colorOverrides, !badgeState.statusStandalone));
  }

  function connectZoom(node: HTMLSpanElement) {
    const motion = createBadgeZoom(
      node.ownerDocument.defaultView!,
      () => indicator,
      value => { zoom = value; }
    );

    $effect(() => motion.sync(wanted, token.token.motion !== false, !badgeState.statusStandalone));
    return () => motion.destroy();
  }
</script>

<style>
  .ant-badge { max-width: 100%; min-width: 0; vertical-align: middle; }
  .ant-badge .ant-badge-indicator { pointer-events: none; margin-top: var(--ant-badge-offset-top, 0px); inset-inline-end: var(--ant-badge-offset-inline, 0px); box-shadow: 0 0 0 var(--ant-line-width) var(--ant-color-bg-container); }
  .ant-badge-source-tokens .ant-badge-indicator { box-shadow: 0 0 0 var(--ant-line-width) var(--ant-color-border-bg); }
  .ant-badge-not-a-wrapper .ant-badge-indicator { position: relative; top: auto; transform: none; display: inline-flex; }
  .ant-badge-status-standalone { margin-top: var(--ant-badge-offset-top, 0px); inset-inline-end: var(--ant-badge-offset-inline, auto); }
  .ant-badge-status-text { margin-inline-start: var(--ant-margin-xs); color: var(--ant-color-text); font-size: var(--ant-font-size); overflow-wrap: anywhere; }
  .ant-badge-source-count.ant-badge-not-a-wrapper .ant-badge-indicator { display: block; }
  .ant-badge-source-count:not(.ant-badge-status) .ant-badge-status-text { margin-inline-start: 0; color: inherit; font-size: inherit; }
  /* Прежний numeric offset меняется сразу; анимируются только разряды. */
  .ant-badge:not(.ant-badge-source-count) .ant-scroll-number { transition: none; }
  .ant-badge-description { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (prefers-reduced-motion: reduce) { .ant-badge .ant-badge-indicator, .ant-badge .ant-badge-status-dot, .ant-badge .ant-badge-status-dot::after { transition: none; animation: none; } }
</style>

<span {...rest} bind:this={nativeElement} id={rootId} role={role !== undefined ? role : ariaLabel || ariaLabelledby ? 'group' : undefined} aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={elementDirection !== undefined ? elementDirection : config.direction} title={nativeTitle} onclick={onclick ?? onClick} class={[
    'ant-badge ant-badge-css-var',
    componentTheme.className,
    componentTheme.className && 'ant-badge-source-tokens',
    sourceCount && 'ant-badge-source-count',
    !children && 'ant-badge-not-a-wrapper',
    badgeState.hasStatus && 'ant-badge-status',
    badgeState.statusStandalone && 'ant-badge-status-standalone',
    config.direction === 'rtl' && 'ant-badge-rtl',
    className,
    rootClassName,
    config.badge?.class,
    contextClasses.root,
    localClasses.root
  ]} style={untrack(() => rootStyle)} style:--ant-badge-offset-top={!sourceOffset && position ? `${position[1]}px` : undefined} style:--ant-badge-offset-inline={!sourceOffset && position ? `${-position[0]}px` : undefined} {@attach connectRootStyle} {@attach connectZoom}>
  {#if children}{@render children(context)}{/if}{#if !sourceCount}{' '}{/if}{#if badgeState.statusStandalone || renderCounter}
    {#if badgeState.statusStandalone}<span class={[
        'ant-badge-status-dot',
        contextClasses.indicator,
        localClasses.indicator,
        status && `ant-badge-status-${status}`,
        isPreset && `ant-badge-color-${color}`
      ]} aria-hidden="true" style={untrack(() => indicatorStyle)} {@attach connectIndicatorStyle}></span>{:else if displayed.custom}{@render displayed.custom(countContext)}{:else}<sup bind:this={indicator} data-show={wanted} class={[
          'ant-badge-indicator',
          'ant-scroll-number',
          contextClasses.indicator,
          localClasses.indicator,
          displayed.dot ? 'ant-badge-dot' : 'ant-badge-count',
          size === 'small' && 'ant-badge-count-sm',
          !displayed.dot && displayed.display.length > 1 && 'ant-badge-multiple-words',
          status && `ant-badge-status-${status}`,
          isPreset && `ant-badge-color-${color}`,
          zoom.className
        ]} aria-hidden="true" title={indicatorTitle} style={untrack(() => indicatorStyle)} {@attach connectIndicatorStyle}>{#if !displayed.dot}<BadgeNumber count={displayed.value} />{/if}</sup>{/if}{#if !sourceCount}{' '}{/if}{#if descriptionId}<span id={descriptionId} class="ant-badge-description">{description}</span>{/if}
  {/if}{#if !sourceCount}{' '}{/if}{#if badgeState.showText}<span class="ant-badge-status-text" style={statusTextColor ? `color:${statusTextColor}` : undefined}>{#if typeof text === 'function'}{@render text()}{:else}{text}{/if}</span>{/if}
</span>
