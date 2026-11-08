import type { SelectOption } from 'antd-svelte';

export interface SelectTagCountSample {
  id: string;
  count?: number | string;
  placeholder?: string | number | boolean | null;
  textLength?: number;
  width?: number;
  mode?: string;
  options: readonly SelectOption<string | number>[];
  values: readonly (string | number)[];
}

export function getSelectTagCount(value?: string | number): number | 'responsive' | undefined {
  if (value === 'responsive') return 'responsive';
  return value === 'nan' ? Number.NaN : value === 'infinity' ? Number.POSITIVE_INFINITY
    : typeof value === 'number' ? value : undefined;
}
