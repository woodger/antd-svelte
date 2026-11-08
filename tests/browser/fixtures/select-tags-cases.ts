import type { SelectOption } from 'antd-svelte';

export interface SelectTagsSample {
  id: string;
  options?: readonly SelectOption<string | number>[];
  values?: readonly (string | number)[];
  search?: string;
  filter?: boolean | 'none' | 'label';
  optionFilterProp?: string | readonly string[];
  controlled?: string;
  autoClear?: boolean;
  mode?: 'tags' | 'multiple';
  clear?: boolean;
}

export const selectTagsBaseOptions = [
  { value: 'a', label: 'Alpha' },
  { value: 'locked', label: 'Locked', disabled: true },
  { value: 0, label: 'Zero' }
];
