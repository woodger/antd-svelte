<script lang="ts">
  import { onMount } from 'svelte';
  import ProgressCircle from './ProgressCircle.svelte';
  import { progressCircleIcons } from './progress-circle-icons';
  import { statusIcons } from './status-icons';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getProgressPrefixCss } from './progress-prefix.engine';
  import {
    getProgressCircleGeometry,
    normalizeProgressPercent,
    resolveProgressCircleSize,
    resolveProgressLineSize,
    resolveProgressStatus
  } from './progress.engine';
  import {
    progressGradient,
    progressLineSteps,
    progressSuccessPercent,
    isProgressColorBright
  } from './progress-line.engine';
  import { ruRU } from './types';
  import type {
    ProgressCircleSize, ProgressProps, ProgressSemanticInfo, ProgressSemanticSlots
  } from './progress.types';

  let {
    type = 'line',
    percent = 0,
    status,
    size: providedSize,
    strokeWidth,
    showInfo = true,
    format,
    strokeColor,
    railColor,
    gapDegree,
    gapPlacement,
    strokeLinecap = 'round',
    success,
    steps,
    rounding,
    percentPosition = {},
    prefixCls,
    classNames,
    styles,
    rootClassName,
    children,
    nativeElement = $bindable(),
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-valuetext': ariaValueText,
    class: className = '',
    style,
    ...rest
  }: ProgressProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Progress');
  const icons = {
    line: { success: 'check-circle-filled', exception: 'close-circle-filled' },
    circle: { success: 'check', exception: 'close' }
  } as const;
  let host = $state<HTMLDivElement>();
  let prefix = $derived(prefixCls || 'ant-progress');
  let prefixCss = $derived(getProgressPrefixCss(prefix));
  let size = $derived(providedSize ?? 'medium');
  let value = $derived(normalizeProgressPercent(percent));
  let successValue = $derived(progressSuccessPercent(success));
  let resolvedStatus = $derived(resolveProgressStatus(
    success?.percent === undefined ? value : Number.parseInt(String(success.percent), 10),
    status
  ));
  let lineSize = $derived(resolveProgressLineSize(size));
  let diameter = $derived(resolveProgressCircleSize(
    (providedSize ?? 'medium') as ProgressCircleSize
  ));
  let circle = $derived(getProgressCircleGeometry(value, diameter, strokeWidth));
  let stepCount = $derived(typeof steps === 'object' ? steps.count : steps ?? 0);
  let stepLayout = $derived(steps
    ? progressLineSteps(stepCount, percent, size, rounding) : undefined);
  let pureLine = $derived(type === 'line' && !steps);
  let infoAlign = $derived(percentPosition.align ?? 'end');
  let infoPosition = $derived(percentPosition.type ?? 'outer');
  let lineColor = $derived(Array.isArray(strokeColor) ? strokeColor[0] : strokeColor);
  let background = $derived(typeof lineColor === 'object'
    ? progressGradient(lineColor, config.direction === 'rtl') : lineColor);
  let bright = $derived(isProgressColorBright(strokeColor));
  let strings = $derived({ ...ruRU.progress, ...config.locale.progress });
  // Старый однопараметрический callback сохраняет число вызовов и аргументов.
  let text = $derived(format
    ? format.length > 1 || success !== undefined ? format(value, successValue) : format(value)
    : `${value}%`);
  let plainText = $derived(typeof text === 'string' || typeof text === 'number'
    ? String(text) : `${value}%`);
  let valueText = $derived(
    ariaValueText ?? (format ? plainText
      : resolvedStatus === 'success' ? `${plainText}, ${strings.successText}`
        : resolvedStatus === 'exception' ? `${plainText}, ${strings.exceptionText}` : plainText)
  );
  let statusIcon = $derived(
    !format && infoPosition !== 'inner'
      && (resolvedStatus === 'success' || resolvedStatus === 'exception')
      ? icons[type === 'line' ? 'line' : 'circle'][resolvedStatus] : undefined
  );
  let semanticInfo = $derived<ProgressSemanticInfo>({ props: {
    ...rest,
    id,
    type,
    percent,
    status,
    size,
    strokeWidth,
    showInfo,
    format,
    strokeColor,
    railColor,
    gapDegree,
    gapPlacement,
    strokeLinecap,
    success,
    steps,
    rounding,
    percentPosition,
    prefixCls,
    classNames,
    styles,
    rootClassName,
    children,
    class: className,
    style
  } as ProgressSemanticInfo['props'] });
  let semantics = $derived.by(() => {
    const inheritedClasses = config.progress?.classNames;
    const inheritedStyles = config.progress?.styles;
    const contextClasses = typeof inheritedClasses === 'function'
      ? inheritedClasses(semanticInfo) : inheritedClasses;
    const contextStyles = typeof inheritedStyles === 'function'
      ? inheritedStyles(semanticInfo) : inheritedStyles;
    const localClasses = typeof classNames === 'function' ? classNames(semanticInfo) : classNames;
    const localStyles = typeof styles === 'function' ? styles(semanticInfo) : styles;
    const classes: ProgressSemanticSlots = {};
    const slots: ProgressSemanticSlots = {};

    for (const slot of ['root', 'body', 'rail', 'track', 'indicator'] as const) {
      classes[slot] = [contextClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      slots[slot] = [contextStyles?.[slot], slot === 'root' && config.progress?.style,
        localStyles?.[slot], slot === 'root' && style].filter(Boolean).join(';');
    }
    return { classes, styles: slots };
  });

  onMount(() => {
    nativeElement = host;
    return () => { nativeElement = undefined; };
  });
</script>

<style>
  [data-ant-progress-root]:not([data-ant-progress-steps]) { min-width: 0; max-width: 100%; }
  [data-ant-progress-type="line"]:not([data-ant-progress-steps]) [data-ant-progress-part="body"], [data-ant-progress-type="line"]:not([data-ant-progress-steps]) [data-ant-progress-part="rail"] { min-width: 0; }
  [data-ant-progress-type="line"] [data-ant-progress-part="indicator"][data-ant-progress-position="outer"]:not([data-ant-progress-icon]) { flex: none; max-width: 50%; overflow: hidden; text-overflow: ellipsis; }
  .anticon { display: inline-flex; line-height: 0; vertical-align: -0.125em; }
  [data-ant-progress-direction="rtl"][data-ant-progress-active] [data-ant-progress-part="track"]::after { animation-name: ant-svelte-progress-rtl-active; }
  @keyframes ant-svelte-progress-rtl-active { 0% { transform: translateX(100%) scaleX(0); opacity: 0.1; } 20% { transform: translateX(100%) scaleX(0); opacity: 0.5; } to { transform: translateX(0) scaleX(1); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    [data-ant-progress-root] [data-ant-progress-part="track"], [data-ant-progress-root] [data-ant-progress-part="step"] { transition: none; }
    [data-ant-progress-root][data-ant-progress-active] [data-ant-progress-part="track"]::after { animation: none; }
    [data-ant-progress-root] [data-ant-progress-part="indicator"] :global(*) { animation: none !important; transition: none !important; }
  }
</style>

{#snippet indicator()}
  <span class={[
    `${prefix}-indicator`,
    pureLine && [`${prefix}-indicator-${infoPosition}`, `${prefix}-indicator-${infoAlign}`],
    type === 'line' && infoPosition === 'inner' && bright && `${prefix}-indicator-bright`,
    semantics.classes.indicator
  ]} data-ant-progress-part="indicator" data-ant-progress-position={pureLine ? infoPosition : undefined}
    data-ant-progress-icon={Boolean(statusIcon) || undefined}
    style={semantics.styles.indicator} aria-hidden="true"
    title={typeof text === 'function' ? undefined : valueText}
    dir={statusIcon || infoPosition === 'inner' || steps ? undefined : 'auto'}>{#if statusIcon}<span class="anticon"><svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" fill-rule={type === 'line' && resolvedStatus === 'exception' ? 'evenodd' : undefined} aria-hidden="true" focusable="false"><path d={type === 'line' ? statusIcons[resolvedStatus === 'success' ? 'check-circle-filled' : 'close-circle-filled'] : progressCircleIcons[resolvedStatus === 'success' ? 'success' : 'exception']} /></svg></span>{:else if typeof text === 'function'}{@render text()}{:else if typeof text !== 'boolean'}{text}{/if}</span>
{/snippet}

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`progress-prefix:${prefix}`} />{/if}<div
  bind:this={host} {id} role="progressbar"
  aria-label={ariaLabel ?? (ariaLabelledby ? undefined : strings.label)}
  aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby}
  aria-valuemin="0" aria-valuemax="100" aria-valuenow={value} aria-valuetext={valueText}
  dir={config.direction} data-ant-progress-root data-ant-progress-type={type}
  data-ant-progress-steps={Boolean(steps) || undefined}
  data-ant-progress-prefix={prefixCss ? prefix : undefined}
  data-ant-progress-direction={config.direction}
  data-ant-progress-active={resolvedStatus === 'active' || undefined}
  class={[
    prefix, 'ant-progress-css-var', componentTheme.className,
    `${prefix}-status-${resolvedStatus}`, type !== 'line' && `${prefix}-circle`,
    type === 'circle' && resolveProgressCircleSize(size as ProgressCircleSize) <= 20
      && `${prefix}-inline-circle`,
    pureLine && [`${prefix}-line`, `${prefix}-line-align-${infoAlign}`,
      `${prefix}-line-position-${infoPosition}`],
    steps && `${prefix}-steps`, showInfo && `${prefix}-show-info`,
    size === 'small' && `${prefix}-small`, config.direction === 'rtl' && `${prefix}-rtl`,
    config.progress?.class, className, rootClassName, semantics.classes.root
  ]} style={[componentTheme.style, semantics.styles.root].filter(Boolean).join(';') || undefined}
  {...rest}>
  {#if type !== 'line'}
    <ProgressCircle {prefix} {type} percent={value} {diameter} strokeWidth={circle.strokeWidth}
      strokeColor={lineColor} railColor={railColor} {strokeLinecap} {success} {steps}
      {gapDegree} {gapPlacement} classes={semantics.classes}
      styles={semantics.styles} indicator={showInfo ? indicator : undefined} />
  {:else if steps && stepLayout}
    <div class={[`${prefix}-steps-body`, semantics.classes.body]} style={semantics.styles.body}
      data-ant-progress-part="body">
      {#each stepLayout.items as active, index}
        <div class={[`${prefix}-steps-item`, active && `${prefix}-steps-item-active`,
          semantics.classes.track]} data-ant-progress-part="step"
          style={`background-color: ${active ? (Array.isArray(strokeColor) ? strokeColor[index] : typeof strokeColor === 'string' ? strokeColor : '') ?? '' : railColor ?? ''};width: ${stepLayout.width}px;height: ${stepLayout.height}px;${semantics.styles.track ?? ''}`}></div>
      {/each}
      {#if showInfo}{@render indicator()}{/if}
    </div>
  {:else}
    <div class={[`${prefix}-body`, infoAlign === 'center' && infoPosition === 'outer'
      && `${prefix}-body-layout-bottom`, semantics.classes.body]} data-ant-progress-part="body"
      style={`width: ${lineSize.width};${semantics.styles.body ?? ''}`}>
      <div class={[`${prefix}-rail`, semantics.classes.rail]} data-ant-progress-part="rail"
        style={`height: ${lineSize.height}px;${railColor ? `background: ${railColor};` : ''}${strokeLinecap !== 'round' ? 'border-radius: 0px;' : ''}${semantics.styles.rail ?? ''}`}>
        <div class={[`${prefix}-track`, semantics.classes.track]} data-ant-progress-part="track"
          style={`width: ${value}%;height: ${lineSize.height}px;${background ? `background: ${background};--progress-line-stroke-color: ${background};` : ''}${strokeLinecap !== 'round' ? 'border-radius: 0px;' : ''}${semantics.styles.track ?? ''}`}>
          {#if showInfo && infoPosition === 'inner'}{@render indicator()}{/if}
        </div>
        {#if success?.percent !== undefined}
          <div class={[`${prefix}-track ${prefix}-track-success`, semantics.classes.track]}
            data-ant-progress-part="track"
            style={`width: ${successValue}%;height: ${lineSize.height}px;${success.strokeColor ? `background-color: ${success.strokeColor};` : ''}${strokeLinecap !== 'round' ? 'border-radius: 0px;' : ''}${semantics.styles.track ?? ''}`}></div>
        {/if}
      </div>
      {#if showInfo && infoPosition === 'outer'}{@render indicator()}{/if}
    </div>
  {/if}
</div>
