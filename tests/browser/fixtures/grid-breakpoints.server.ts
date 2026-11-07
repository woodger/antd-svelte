import { render } from 'svelte/server';
import GridBreakpointsCase from './GridBreakpointsCase.svelte';
import type { GridBreakpointsSample } from './grid-breakpoints-presets';

export function renderGridBreakpoints(sample: GridBreakpointsSample) {
  return render(GridBreakpointsCase, { props: { sample }, idPrefix: 'grid-media-ssr-' });
}
