import type { SelectOption, SelectSearchConfig } from 'antd-svelte';

export interface SelectSortSample {
  id: string;
  mode: string;
  search: string;
  sort: string;
  filter?: boolean;
  field?: string;
  options: readonly SelectOption<string | number>[];
  values: readonly (string | number)[];
}

export function getSelectComparator(
  name: string
): SelectSearchConfig<string | number>['filterSort'] {
  if (name === 'none') return undefined;
  const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
  return (a, b, { searchValue }) => {
    if (name === 'equal') return 0;
    if (name === 'value') return compare(String(a.value), String(b.value));
    const order = compare(a.label.toLowerCase(), b.label.toLowerCase());
    return name === 'desc' || name === 'query' && searchValue.trim() === 'turn' ? -order : order;
  };
}
