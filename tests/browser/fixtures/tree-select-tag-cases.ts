import type { TreeSelectRawValue, TreeSelectValue, TreeSelectStrategy } from 'antd-svelte';

export type TreeTagAction =
  | { kind: 'open' | 'update-data' | 'update-count' | 'update-length' | 'clear'; }
  | { kind: 'search' | 'key'; value: string; }
  | { kind: 'remove' | 'close' | 'tag' | 'choose'; value: TreeSelectRawValue; }
  | { kind: 'resize'; value: number; };

export interface TreeTagSample {
  id: string;
  length?: number | 'nan' | 'infinity';
  count?: number | 'nan' | 'infinity' | 'responsive';
  nextLength?: number;
  nextCount?: number;
  kind?: 'number' | 'zero' | 'array' | 'boolean' | 'null' | 'element' | 'emoji' | 'middle-emoji';
  placeholder?: string | number | boolean | null;
  placeholderKind?: 'snippet' | 'element' | 'input';
  renderer?: boolean;
  titleRenderer?: boolean;
  stopClose?: boolean;
  disabled?: boolean;
  single?: boolean;
  checkable?: boolean;
  strict?: boolean;
  strictOnly?: boolean;
  labeled?: boolean;
  value?: TreeSelectValue;
  strategy?: TreeSelectStrategy;
  alias?: boolean;
  simple?: boolean;
  rtl?: boolean;
  prefix?: string;
  width?: number;
  maxCount?: number;
  controlled?: 'accept' | 'hold';
  actions?: readonly TreeTagAction[];
}

export function treeTagNumber(value?: number | string): number | undefined {
  return value === 'nan' ? Number.NaN : value === 'infinity' ? Number.POSITIVE_INFINITY
    : typeof value === 'number' ? value : undefined;
}

export function treeTagValues(sample: TreeTagSample): TreeSelectValue {
  return sample.value ?? (sample.single ? 0 : [0, 1, 'locked', 'tail']);
}

export function treeTagData(sample: TreeTagSample, update = false): Record<string, unknown>[] {
  const first = sample.kind === 'number' ? 123456 : sample.kind === 'zero' ? 0
    : sample.kind === 'array' ? ['Array', 0, false, ' label'] : sample.kind === 'boolean' ? true
      : sample.kind === 'null' ? null : sample.kind === 'emoji' ? '😀word'
        : sample.kind === 'middle-emoji' ? 'A😀word' : 'Alphabet';
  const field = sample.alias ? 'code' : 'value';
  const label = sample.alias ? 'caption' : 'title';
  const children = sample.alias ? 'nodes' : 'children';
  const leaf = (value: TreeSelectRawValue, title: unknown, disabled?: boolean) => ({
    [field]: value, [label]: update && typeof title === 'string' ? `${title} updated` : title,
    payload: { id: value }, isLeaf: true, disabled
  });
  const descendants = [leaf(0, first), leaf(1, 'Beta'), leaf('locked', 'Locked', true)];
  const parent = { [field]: 'p', [label]: 'Parent', payload: { id: 'p' },
    ...(!sample.simple ? { [children]: descendants } : {}) };
  return sample.simple ? [{ ...parent, id: 'p', pId: null }, ...descendants.map(node => ({
    ...node, id: node[field], pId: 'p'
  })), { ...leaf('tail', 'Tail'), id: 'tail', pId: null }]
    : [parent, leaf('tail', 'Tail')];
}

export const treeTagSamples: readonly TreeTagSample[] = [
  { id: 'default' },
  { id: 'text-three', length: 3, actions: [{ kind: 'remove', value: 'tail' }] },
  { id: 'text-zero', length: 0 },
  { id: 'text-negative', length: -1 },
  { id: 'text-fraction', length: 1.5 },
  { id: 'text-nan', length: 'nan' },
  { id: 'text-infinity', length: 'infinity' },
  { id: 'number', kind: 'number', length: 3 },
  { id: 'numeric-zero', kind: 'zero', length: 0 },
  { id: 'boolean', kind: 'boolean', length: 1 },
  { id: 'null-label', kind: 'null', length: 0 },
  { id: 'element', kind: 'element', length: 1 },
  { id: 'count-zero', count: 0 },
  { id: 'count-one', count: 1, actions: [{ kind: 'key', value: 'Backspace' }] },
  { id: 'count-two', count: 2, length: 3 },
  { id: 'count-negative', count: -1 },
  { id: 'count-fraction', count: 1.5 },
  { id: 'count-infinity', count: 'infinity' },
  { id: 'placeholder-text', count: 1, placeholder: 'More values' },
  { id: 'placeholder-zero', count: 1, placeholder: 0 },
  { id: 'placeholder-false', count: 1, placeholder: false },
  { id: 'placeholder-null', count: 1, placeholder: null },
  { id: 'placeholder-snippet', count: 1, length: 2, placeholderKind: 'snippet' },
  { id: 'placeholder-element', count: 1, placeholderKind: 'element' },
  { id: 'child-strategy', count: 1, checkable: true, value: ['p'], placeholderKind: 'snippet' },
  { id: 'all-strategy', count: 1, checkable: true, strategy: 'SHOW_ALL', value: ['p'] },
  { id: 'parent-strategy', count: 0, checkable: true, strategy: 'SHOW_PARENT', value: ['p'] },
  { id: 'strict-half', count: 1, strict: true, value: [{ value: 0 }, { value: 1 },
    { value: 'p', halfChecked: true }], placeholderKind: 'snippet' },
  { id: 'missing', count: 1, length: 1, value: [99, 'tail'] },
  { id: 'labeled', count: 1, length: 2, labeled: true,
    value: [{ value: 0, label: 'Custom label' }, { value: 'tail' }], placeholderKind: 'snippet' },
  { id: 'aliases', count: 1, length: 3, alias: true, placeholderKind: 'snippet' },
  { id: 'simple', count: 1, simple: true, placeholderKind: 'snippet' },
  { id: 'single', count: 0, length: 1, single: true, renderer: true },
  { id: 'max-count', count: 0, maxCount: 1, value: [0, 1],
    actions: [{ kind: 'open' }, { kind: 'choose', value: 'tail' }, { kind: 'clear' }] },
  { id: 'renderer', renderer: true, length: 3, actions: [{ kind: 'tag', value: 0 },
    { kind: 'close', value: 1 }] },
  { id: 'renderer-summary', renderer: true, count: 1, placeholderKind: 'snippet' },
  { id: 'renderer-locked', renderer: true, value: ['locked', 0] },
  { id: 'renderer-disabled', renderer: true, disabled: true },
  { id: 'renderer-stop-close', renderer: true, stopClose: true,
    actions: [{ kind: 'close', value: 0 }] },
  { id: 'renderer-held', renderer: true, controlled: 'hold', actions: [{ kind: 'close', value: 0 }] },
  { id: 'renderer-strict-only', renderer: true, strict: true, strictOnly: true,
    value: [{ value: 0 }, { value: 1 }] },
  { id: 'renderer-strict-checkable', renderer: true, strict: true, checkable: true,
    value: [{ value: 0 }, { value: 1 }] },
  { id: 'count-update', nextCount: 1, actions: [{ kind: 'update-count' }] },
  { id: 'text-update', length: 2, nextLength: 5, actions: [{ kind: 'update-length' }] },
  { id: 'data-update', count: 1, length: 3, placeholderKind: 'snippet', actions: [{ kind: 'update-data' }] },
  { id: 'rtl-prefix', count: 1, length: 3, rtl: true, prefix: 'choices' },
  { id: 'responsive-400', count: 'responsive', width: 400,
    actions: [{ kind: 'resize', value: 200 }, { kind: 'resize', value: 400 }] },
  { id: 'responsive-fit-320', count: 'responsive', width: 320 },
  { id: 'responsive-renderer', renderer: true, count: 'responsive', width: 400,
    actions: [{ kind: 'resize', value: 200 }, { kind: 'resize', value: 400 }] }
];

export const treeTagObservations: readonly TreeTagSample[] = [
  { id: 'emoji-split', kind: 'emoji', length: 1 },
  { id: 'middle-emoji-split', kind: 'middle-emoji', length: 2 },
  { id: 'count-nan', count: 'nan' },
  { id: 'opaque-array-title', kind: 'array', length: 1 },
  { id: 'title-renderer', titleRenderer: true, labeled: true, length: 2,
    value: [{ value: 0 }, { value: 1 }] },
  { id: 'responsive-long-rest', count: 'responsive', width: 320, placeholder: 'Hidden values remain selected' }
];
