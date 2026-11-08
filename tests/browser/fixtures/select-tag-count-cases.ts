import type { SelectOption } from 'antd-svelte';

export interface SelectTagCountSample {
  id: string;
  count?: number | string;
  placeholder?: string | number | boolean | null;
  textLength?: number;
  mode?: string;
  options: readonly SelectOption<string | number>[];
  values: readonly (string | number)[];
}

export function getSelectTagCount(value?: string | number) {
  return value === 'nan' ? Number.NaN : value === 'infinity' ? Number.POSITIVE_INFINITY
    : typeof value === 'number' ? value : undefined;
}
