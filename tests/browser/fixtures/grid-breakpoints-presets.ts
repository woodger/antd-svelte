import type { ThemeConfig } from 'antd-svelte';
import reference from './ant-design-grid-breakpoints-reference.json' with { type: 'json' };

export type GridBreakpointsSample = Omit<typeof reference.cases[number], 'config'> & {
  config: ThemeConfig;
};
export const gridBreakpointsSamples: GridBreakpointsSample[] = reference.cases;
export const gridBreakpointsSampleKey = (sample: GridBreakpointsSample) =>
  `${sample.name}:${sample.direction}:${sample.scope}`;
