<script lang="ts">
  import { untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { typographyNodeLength, typographyNodes, typographySlice } from './typography.engine';
  import type { TypographyContent } from './typography.types';

  let {
    text,
    width,
    rows,
    enableMeasure,
    expanded,
    placement,
    children,
    onEllipsis
  }: {
    text?: TypographyContent;
    width: number;
    rows: number;
    enableMeasure: boolean;
    expanded: boolean;
    placement: 'start' | 'end';
    children: Snippet<[nodes: TypographyContent[], canEllipsis: boolean, measuring: boolean]>;
    onEllipsis: (ellipsis: boolean) => void;
  } = $props();

  let nodes = $derived(typographyNodes(text));
  let length = $derived(typographyNodeLength(text));
  let phase = $state<'none' | 'prepare' | 'start' | 'need' | 'fit'>('none');
  let range = $state.raw<readonly [number, number] | null>(null);
  let canEllipsis = $state(false);
  let limit = $state(0);
  let whitespace = $state<string | undefined>();
  let space = $state<HTMLSpanElement>();
  let full = $state<HTMLSpanElement>();
  let previousRows = $state<HTMLSpanElement>();
  let symbol = $state<HTMLSpanElement>();
  let midpoint = $state<HTMLSpanElement>();
  let middle = $derived(range ? Math.ceil((range[0] + range[1]) / 2) : 0);
  let complete = $derived(phase === 'need' && range !== null && range[0] === range[1]);
  let measuringStyle = $derived(`position:fixed;display:block;left:0;top:0;pointer-events:none;`+
    `width:${width}px;margin:0;padding:0;white-space:${whitespace === 'nowrap' ? 'normal' : 'inherit'}`);
  let clippedStyle = $derived(`${measuringStyle};display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical`);

  $effect(() => {
    void text;
    void rows;
    void placement;
    const prepare = enableMeasure && width && length;
    untrack(() => { phase = prepare ? 'prepare' : 'none'; });
  });

  $effect(() => {
    if (phase === 'prepare' && space) {
      whitespace = space.ownerDocument.defaultView?.getComputedStyle(space).whiteSpace;
      phase = 'start';
    } else if (phase === 'start' && full && previousRows && symbol) {
      const overflow = full.scrollHeight > full.clientHeight;
      const previousHeight = rows === 1 ? 0 : previousRows.clientHeight;
      limit = Math.max(full.clientHeight, previousHeight + symbol.clientHeight) + 1;
      phase = overflow ? 'need' : 'fit';
      range = overflow ? [0, length] : null;
      canEllipsis = overflow;
      untrack(() => onEllipsis(overflow));
    }
  });

  $effect(() => {
    const current = range;
    const index = middle;
    if (phase !== 'need' || !current || current[0] === current[1] || !midpoint) return;
    const overflow = midpoint.clientHeight > limit;
    const next = current[1] - current[0] === 1
      ? overflow ? current[0] : current[1] : index;
    range = overflow ? [current[0], next] : [next, current[1]];
  });
</script>

{#if !enableMeasure}
  {@render children(nodes, false, false)}
{:else if complete && range}
  {@render children(expanded ? nodes : typographySlice(text, range[0]), canEllipsis, false)}
{:else if phase === 'none' || phase === 'fit'}
  {@render children(nodes, false, false)}
{:else}
  <span style={`display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:${rows}`}>
    {@render children(nodes, false, false)}
  </span>
{/if}

{#if phase === 'prepare'}
  <span bind:this={space} style="white-space:inherit"></span>
{:else if phase === 'start'}
  <span bind:this={full} aria-hidden="true" style={`${clippedStyle};-webkit-line-clamp:${rows}`}>
    {@render children(nodes, false, true)}
  </span>
  <span bind:this={previousRows} aria-hidden="true" style={`${clippedStyle};-webkit-line-clamp:${rows - 1}`}>
    {@render children(nodes, false, true)}
  </span>
  <span bind:this={symbol} aria-hidden="true" style={`${clippedStyle};-webkit-line-clamp:1`}>
    {@render children([], true, true)}
  </span>
{:else if phase === 'need' && range && !complete}
  <span bind:this={midpoint} aria-hidden="true" style={`${measuringStyle};top:400px`}>
    {@render children(typographySlice(text, middle), true, true)}
  </span>
{/if}
