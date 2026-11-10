import type { TreeSelectValue } from 'antd-svelte';
import { treeTagData, type TreeTagSample } from './tree-select-tag-cases.ts';

export type TreeLabelAction =
  | { kind: 'open' | 'clear' | 'update-data' | 'remove-data' | 'update-renderer'
    | 'remove-renderer' | 'update-both'; }
  | { kind: 'choose'; value: string | number; }
  | { kind: 'key'; value: string; };

export interface TreeLabelSample extends Pick<TreeTagSample,
  'id' | 'single' | 'checkable' | 'strict' | 'strategy' | 'alias' | 'simple' | 'kind' | 'controlled'> {
  value?: TreeSelectValue;
  labeled?: boolean;
  count?: number;
  customTag?: boolean;
  labelProp?: string;
  renderer?: boolean;
  version?: 'Old' | 'New';
  actions?: readonly TreeLabelAction[];
}

const chooseTail: readonly TreeLabelAction[] = [{ kind: 'open' }, { kind: 'choose', value: 'tail' }];
export const treeLabelSamples: readonly TreeLabelSample[] = [
  { id: 'multiple', actions: [...chooseTail, { kind: 'key', value: 'Backspace' }] },
  { id: 'single', single: true, actions: [{ kind: 'open' }, { kind: 'choose', value: 1 }, { kind: 'clear' }] },
  { id: 'labeled', labeled: true, value: [{ value: 0, label: 'Custom' }, { value: 1 }], actions: chooseTail },
  { id: 'single-labeled', single: true, labeled: true, value: { value: 0, label: 'Custom' },
    actions: [{ kind: 'open' }, { kind: 'choose', value: 1 }] },
  { id: 'strict-half', strict: true, value: [{ value: 0 }, { value: 1 },
    { value: 'p', halfChecked: true }], actions: chooseTail },
  { id: 'strict-missing-half', strict: true, value: [{ value: 0 },
    { value: 99, label: 'Outside half', halfChecked: true }], actions: chooseTail },
  { id: 'child', checkable: true, value: ['p'], actions: chooseTail },
  { id: 'all', checkable: true, strategy: 'SHOW_ALL', value: ['p'], actions: chooseTail },
  { id: 'parent', checkable: true, strategy: 'SHOW_PARENT', value: ['p'], actions: chooseTail },
  { id: 'parent-labeled', checkable: true, strategy: 'SHOW_PARENT', labeled: true,
    value: [{ value: 'p', label: 'Custom parent' }], actions: chooseTail },
  { id: 'missing', labeled: true, value: [{ value: 99, label: 'Outside' }, { value: 0 }], actions: chooseTail },
  { id: 'aliases', alias: true, actions: chooseTail },
  { id: 'simple', simple: true, actions: chooseTail },
  { id: 'aliases-simple', alias: true, simple: true, actions: chooseTail },
  { id: 'label-prop', labelProp: 'alt', actions: chooseTail },
  { id: 'controlled-accept', controlled: 'accept', actions: chooseTail },
  { id: 'controlled-hold', controlled: 'hold', labeled: true,
    value: [{ value: 0, label: 'Custom' }, { value: 1 }], actions: chooseTail },
  { id: 'one-visible', count: 1, actions: chooseTail },
  { id: 'custom-tags', count: 1, customTag: true, actions: chooseTail },
  { id: 'array-data', kind: 'array', actions: chooseTail },
  { id: 'zero-data', kind: 'zero', actions: chooseTail },
  { id: 'disabled-record', value: ['locked', 0], actions: chooseTail },
  { id: 'data-update', actions: [...chooseTail, { kind: 'update-data' }, { kind: 'choose', value: 1 }] },
  { id: 'data-remove', labeled: true,
    actions: [...chooseTail, { kind: 'remove-data' }, { kind: 'choose', value: 1 }] },
  { id: 'renderer-and-data', actions: [{ kind: 'update-both' }, ...chooseTail] },
  { id: 'plain-counterpart', renderer: false, actions: chooseTail },
  { id: 'fresh-renderer-counterpart', version: 'New', actions: chooseTail },
  { id: 'clear', actions: [{ kind: 'clear' }] }
];

export const treeLabelObservations: readonly TreeLabelSample[] = [
  { id: 'stale-renderer', actions: [{ kind: 'update-renderer' }, ...chooseTail] },
  { id: 'removed-renderer', actions: [{ kind: 'remove-renderer' }, ...chooseTail] }
];

export function treeLabelValues(sample: TreeLabelSample): TreeSelectValue {
  return sample.value ?? (sample.single ? 0 : [0, 1]);
}

export function treeLabelData(sample: TreeLabelSample, updated = false, remove = false) {
  const value = sample.alias ? 'code' : 'value';
  const label = sample.alias ? 'caption' : 'title';
  const children = sample.alias && !sample.simple ? 'nodes' : 'children';
  function visit(nodes: readonly Record<string, unknown>[]): Record<string, unknown>[] {
    return nodes.filter(node => !remove || node[value] !== 0).map(node => ({ ...node,
      alt: `Alternate ${String(node[label])}`,
      ...(Array.isArray(node[children]) ? { [children]: visit(node[children]) } : {})
    }));
  }
  return visit(treeTagData({ id: sample.id, alias: sample.alias, simple: sample.simple, kind: sample.kind }, updated));
}
