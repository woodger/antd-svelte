import type { Snippet } from 'svelte';
import type { TooltipContent } from 'antd-svelte';
import reference from './ant-design-tooltip-content-reference.json' with { type: 'json' };

type ContentValue = string | number | boolean | null | undefined
  | { kind: 'rich' | 'nan' } | readonly ContentValue[];

export interface TooltipContentCase {
  name: string;
  title?: ContentValue;
  overlay?: ContentValue;
  nativeWhitespaceBoundary?: boolean;
  snapshot: { visible: boolean; text: string | null; events: boolean[]; };
}

export const contentCases = reference.cases as readonly TooltipContentCase[];

export function tooltipContentValue(value: ContentValue, rich: Snippet): TooltipContent {
  if (typeof value !== 'object' || value === null) return value;
  if ('kind' in value) return value.kind === 'nan' ? Number.NaN : rich;
  return value.map(node => tooltipContentValue(node, rich));
}
