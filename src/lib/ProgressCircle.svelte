<script lang="ts">
  import Tooltip from './Tooltip.svelte';
  import { useConfig } from './config-context';
  import { connectInlineStyle } from './inline-style.dom';
  import { getInlineStyleDeclarations } from './inline-style.engine';
  import type { InlineStyleLayer } from './inline-style.engine';
  import { progressCircleGradient, progressCircleLayout, progressGapPosition }
    from './progress-circle.engine';
  import type { Snippet } from 'svelte';
  import type {
    ProgressGapPlacement, ProgressGradient, ProgressSemanticSlots,
    ProgressSuccess
  } from './progress.types';

  let {
    prefix,
    type,
    percent,
    diameter,
    strokeWidth,
    strokeColor,
    railColor,
    strokeLinecap,
    success,
    steps,
    gapDegree,
    gapPlacement,
    classes,
    styles,
    indicator
  }: {
    prefix: string;
    type: 'circle' | 'dashboard';
    percent: number;
    diameter: number;
    strokeWidth: number;
    strokeColor?: string | ProgressGradient;
    railColor?: string;
    strokeLinecap: 'round' | 'butt' | 'square';
    success?: ProgressSuccess;
    steps?: number | { count: number; gap: number; };
    gapDegree?: number;
    gapPlacement?: ProgressGapPlacement;
    classes: ProgressSemanticSlots;
    styles: ProgressSemanticSlots;
    indicator?: Snippet;
  } = $props();
  const id = $props.id();
  const config = useConfig();
  const gradientId = `ant-svelte-progress-${id}-gradient`;
  let svg = $state<SVGSVGElement>();
  let previousTimestamp: number | undefined;
  const styleWriters = new WeakMap<SVGCircleElement, ReturnType<typeof connectInlineStyle>>();
  let tooltipRendered = $state(false);
  let gap = $derived(gapDegree || gapDegree === 0 ? gapDegree : type === 'dashboard' ? 75 : 0);
  let gradient = $derived(Boolean(strokeColor && typeof strokeColor === 'object'));
  // Native сжатие сохраняет квадрат; явный semantic width оставляет исходную высоту.
  let bodyHeight = $derived.by(() => {
    for (const declaration of getInlineStyleDeclarations([styles.body])) {
      if (declaration.property === 'width' || declaration.property === 'inline-size') {
        return `${diameter}px`;
      }
    }
    return 'auto';
  });
  let layout = $derived(progressCircleLayout({
    percent,
    success,
    strokeWidth,
    color: strokeColor,
    railColor,
    cap: strokeLinecap,
    steps,
    gap,
    position: progressGapPosition(type, config.direction, gapPlacement)
  }));

  $effect(() => {
    if (diameter > 20) tooltipRendered = false;
  });

  $effect(() => {
    const element = svg;
    void layout;
    void styles;
    if (!element) return;

    const paths = element.querySelectorAll<SVGCircleElement>('[data-ant-progress-circle-path]');
    const rail = element.querySelector<SVGCircleElement>('[data-ant-progress-circle-rail]');
    if (rail && layout.rail) writeStyle(rail, layers(layout.rail, styles.rail));

    const now = Date.now();
    for (const [index, path] of paths.entries()) {
      writeStyle(path, layers(layout.paths[index], styles.track));
      path.style.transitionDuration = previousTimestamp && now - previousTimestamp < 100
        ? '0s, 0s' : '.3s, .3s, .3s, .06s';
    }
    if (paths.length) previousTimestamp = Date.now();
  });

  function writeStyle(node: SVGCircleElement, value: InlineStyleLayer[]) {
    let writer = styleWriters.get(node);
    if (!writer) {
      writer = connectInlineStyle(node, true);
      styleWriters.set(node, writer);
    }

    writer(value);
  }

  function layers(
    path: typeof layout.rail & { percent?: number; },
    extra?: string
  ): InlineStyleLayer[] {
    if (!path) return [extra];

    return [[
      ['stroke', path.stroke ?? ''],
      ['stroke-dasharray', path.dashArray],
      ['stroke-dashoffset', String(path.dashOffset)],
      ['transform', path.transform],
      ['transform-origin', '50px 50px'],
      ['transition', path.transition],
      ['fill-opacity', '0'],
      ['opacity', path.percent === 0 ? '0' : '1']
    ], extra];
  }

  function pathStyle(path: typeof layout.paths[number], extra?: string) {
    return [
      path.stroke && `stroke: ${path.stroke}`,
      `stroke-dasharray: ${path.dashArray}`,
      `stroke-dashoffset: ${path.dashOffset}`,
      `transform: ${path.transform}`,
      'transform-origin: 50px 50px',
      `transition: ${path.transition}`,
      'fill-opacity: 0',
      `opacity: ${path.percent === 0 ? 0 : 1}`,
      extra
    ].filter(Boolean).join(';');
  }
</script>

<style>
  [data-ant-progress-circle-body] { max-width: 100%; }
  [data-ant-progress-circle-body] > svg { width: 100%; height: auto; vertical-align: top; }
  [data-ant-progress-circle-body] :global([data-ant-progress-part="indicator"]) { padding-inline: 10%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  @media (prefers-reduced-motion: reduce) {
    [data-ant-progress-circle-body] :global(circle) { transition: none !important; }
  }
</style>

{#snippet pathNode(path: typeof layout.paths[number])}
  <circle class={[`${prefix}-circle-path`, classes.track]} r={layout.radius} cx="50" cy="50"
    stroke={typeof path.color === 'object' ? path.step ? `url(#${gradientId})` : '#FFF' : undefined}
    stroke-width={strokeWidth} stroke-linecap={path.step ? undefined : layout.cap}
    stroke-dasharray={`${layout.perimeter} ${layout.perimeter}`}
    stroke-dashoffset={layout.perimeter * (1 - path.percent / 100)}
    transform={gap === 0 ? 'rotate(-90 50 50)' : undefined}
    opacity={path.percent === 0 ? 0 : 1} fill="none"
    data-ant-progress-circle-path data-ant-progress-part="circle-path"
    style={pathStyle(path, styles.track)} />
{/snippet}

{#snippet body()}
  <div class={[`${prefix}-body`, gradient && `${prefix}-circle-gradient`, classes.body]}
    data-ant-progress-circle-body data-ant-progress-part="body"
    style={`width: ${diameter}px;height: ${bodyHeight};aspect-ratio: 1;font-size: ${diameter * 0.15 + 6}px;${styles.body ?? ''}`}>
    <svg bind:this={svg} class={`${prefix}-circle`} viewBox="0 0 100 100"
      aria-hidden="true" focusable="false">
      {#if layout.rail}
        <circle class={[`${prefix}-circle-rail`, classes.rail]} r={layout.radius} cx="50" cy="50"
          data-ant-progress-circle-rail
          stroke={railColor} stroke-width={strokeWidth} stroke-linecap={layout.cap} fill="none"
          style={`stroke: ${layout.rail.stroke ?? ''};stroke-dasharray: ${layout.rail.dashArray};stroke-dashoffset: ${layout.rail.dashOffset};transform: ${layout.rail.transform};transform-origin: 50px 50px;transition: ${layout.rail.transition};fill-opacity: 0;${styles.rail ?? ''}`} />
      {/if}
      {#each layout.paths as path (path.index)}
        {#if !path.step && path.color && typeof path.color === 'object'}
          {@const backgrounds = progressCircleGradient(path.color, gap)}
          <mask id={`${gradientId}-conic`}>{@render pathNode(path)}</mask>
          <foreignObject x="0" y="0" width="100" height="100" mask={`url(#${gradientId}-conic)`}>
            <div style={`width:100%;height:100%;background:${backgrounds.linear}`}><div style={`width:100%;height:100%;background:${backgrounds.conic}`}></div></div>
          </foreignObject>
        {:else}
          {@render pathNode(path)}
        {/if}
      {/each}
    </svg>
    {#if diameter > 20}{@render indicator?.()}{/if}
  </div>
{/snippet}

{#snippet tooltipTitle()}
  {#if tooltipRendered}{@render indicator?.()}{/if}
{/snippet}

<!-- Native Tooltip сохраняет скрытый контент; маленький Progress создаёт подпись при открытии. -->
{#if diameter <= 20}<Tooltip title={indicator ? tooltipTitle : undefined} onOpenChange={(next) => { if (next) tooltipRendered = true; }}>{@render body()}</Tooltip>{:else}{@render body()}{/if}
