import type { SelectTagsSample } from './select-tags-cases';

export interface SelectLimitSample extends SelectTagsSample {
  limit: number | string;
  text?: string;
  separators?: readonly string[];
  splitter?: string;
  open?: boolean;
  keys?: readonly string[];
  blur?: boolean;
  compose?: boolean;
}

export function getSelectCountLimit(value: number | string) {
  return value === 'nan' ? Number.NaN : value === 'infinity' ? Number.POSITIVE_INFINITY
    : typeof value === 'number' ? value : undefined;
}
