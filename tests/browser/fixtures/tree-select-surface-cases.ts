export type TreeSelectSurfaceContent = string | number | boolean | null
  | { kind: 'rich'; } | readonly TreeSelectSurfaceContent[];

export type TreeSelectSurfaceAction = 'focus' | 'open' | 'outside' | 'search' | 'reset-search' | 'remove'
  | 'clear' | 'clear-key' | 'choose' | 'draft' | 'popup-background' | 'enter' | 'escape' | 'toggle-menu';

export interface TreeSelectSurfaceSample {
  id: string;
  prefix?: TreeSelectSurfaceContent;
  suffix?: TreeSelectSurfaceContent | { kind: 'info'; };
  suffixIcon?: TreeSelectSurfaceContent;
  allowClear?: boolean | { clearIcon?: TreeSelectSurfaceContent; label?: string; };
  removeIcon?: TreeSelectSurfaceContent;
  tagRender?: boolean;
  value?: string | string[];
  multiple?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  loading?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  keepSearch?: boolean;
  holdValue?: boolean;
  popup?: 'wrap' | 'replace' | 'empty';
  emptyData?: boolean;
  rtl?: boolean;
  actions?: readonly TreeSelectSurfaceAction[];
}

const rich = { kind: 'rich' } as const;
const info = { kind: 'info' } as const;

export const treeSelectSurfaceData = [
  { value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' },
  { value: 'c', title: 'Locked', disabled: true }
];

export const treeSelectSurfaceSamples: readonly TreeSelectSurfaceSample[] = [
  { id: 'default', value: 'a', allowClear: true, actions: ['open', 'choose', 'clear'] },
  { id: 'prefix-rich', prefix: ['Prefix ', rich, 0, true, false, null] },
  { id: 'affix-zero', prefix: 0, suffix: 0, suffixIcon: rich, multiple: true, value: ['a'], removeIcon: 0 },
  { id: 'affix-false', prefix: false, suffix: false, suffixIcon: rich, multiple: true, value: ['a'], removeIcon: false },
  { id: 'affix-empty', prefix: '', suffix: '', suffixIcon: rich, multiple: true, value: ['a'], removeIcon: '' },
  { id: 'affix-array', prefix: [], suffix: [] },
  { id: 'icon-null', suffixIcon: null, suffix: null, loading: true },
  { id: 'icon-false', prefix: true, suffixIcon: false, loading: true },
  { id: 'icon-zero', suffixIcon: 0 },
  { id: 'icon-empty', suffixIcon: '' },
  { id: 'icon-rich-rtl', prefix: rich, suffixIcon: rich, showSearch: true, loading: true,
    rtl: true, actions: ['open', 'outside'] },
  { id: 'suffix-override', suffix: [rich, ' end'], suffixIcon: null, loading: true },
  { id: 'suffix-state', suffix: info, suffixIcon: rich, showSearch: true,
    actions: ['focus', 'open', 'search', 'reset-search', 'outside'] },
  { id: 'suffix-default-search', suffix: info, multiple: true },
  { id: 'suffix-controlled-search', suffix: info, searchValue: 'b', multiple: true, defaultOpen: true, loading: false },
  { id: 'search-icon', showSearch: true, actions: ['open', 'outside'] },
  { id: 'loading-icon', loading: true, showSearch: true, defaultOpen: true },
  { id: 'clear-remove', multiple: true, value: ['a', 'b'], allowClear: { clearIcon: rich, label: 'Reset selection' },
    removeIcon: [rich, '×'], actions: ['open', 'remove', 'clear-key'] },
  { id: 'clear-empty', value: 'a', allowClear: {} },
  { id: 'clear-open-single', value: 'a', allowClear: { clearIcon: rich }, actions: ['open', 'clear'] },
  { id: 'clear-empty-label', multiple: true, value: ['a', 'c'],
    allowClear: { clearIcon: 0, label: '' }, removeIcon: null },
  { id: 'clear-disabled', multiple: true, value: ['a'], allowClear: { clearIcon: rich }, disabled: true },
  { id: 'clear-search-only', allowClear: { clearIcon: false, label: 'Reset selection' },
    keepSearch: true, suffix: info, actions: ['search', 'clear-key'] },
  { id: 'clear-hold-value', multiple: true, value: ['a'], holdValue: true, searchValue: 'b',
    allowClear: { clearIcon: rich, label: 'Reset selection' }, actions: ['clear'] },
  { id: 'custom-tag', multiple: true, value: ['a'], removeIcon: rich, tagRender: true },
  { id: 'popup-wrap', popup: 'wrap', suffix: info, showSearch: true, value: 'a',
    actions: ['open', 'search', 'popup-background', 'focus', 'reset-search', 'draft',
      'popup-background', 'outside', 'open', 'choose'] },
  { id: 'popup-replace', popup: 'replace',
    actions: ['open', 'enter', 'toggle-menu', 'focus', 'toggle-menu', 'enter', 'toggle-menu', 'focus', 'choose'] },
  { id: 'popup-empty', popup: 'empty', actions: ['open', 'enter', 'escape'] },
  { id: 'popup-empty-data', popup: 'wrap', emptyData: true, defaultOpen: true }
];
