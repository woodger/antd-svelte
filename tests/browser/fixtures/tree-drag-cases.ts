export interface TreeDragData {
  key: string | number;
  title: string;
  payload: number;
  disabled?: boolean;
  children?: TreeDragData[];
}

export type TreeDragAction = {
  kind: 'dragstart' | 'dragenter' | 'dragover' | 'dragleave' | 'drop' | 'dragend';
  key: string | number;
  x?: number;
  y?: number;
  target?: 'row' | 'content' | 'title' | 'handle';
} | { kind: 'wait'; milliseconds: number; }
  | { kind: 'allow'; value: boolean; }
  | { kind: 'prefix'; value: string; }
  | { kind: 'payload'; }
  | { kind: 'append-child'; }
  | { kind: 'scroll'; key: string; }
  | { kind: 'unmount'; }
  | { kind: 'windowend'; };

export interface TreeDragSample {
  id: string;
  direction?: 'ltr' | 'rtl';
  prefix?: string;
  localPrefix?: string;
  directory?: boolean;
  icon?: 'hidden' | 'custom' | 'empty' | 'control';
  predicate?: boolean;
  disabled?: boolean;
  allow?: 'gap' | 'inside' | 'before' | 'never' | 'live';
  controlled?: 'accept' | 'reject';
  virtual?: boolean;
  indent?: number;
  checkable?: boolean;
  mutateEvents?: boolean;
  expanded?: (string | number)[];
  actions: TreeDragAction[];
}

export function treeDragData(virtual = false): TreeDragData[] {
  if (virtual) return Array.from({ length: 60 }, (_, index) => ({
    key: `v${index}`, title: `Virtual ${index}`, payload: index
  }));

  return [
    { key: 'a', title: 'Alpha', payload: 1, children: [
      { key: 'a1', title: 'Alpha one', payload: 11 },
      { key: 'a2', title: 'Alpha two', payload: 12, children: [
        { key: 'a21', title: 'Alpha two one', payload: 121 },
        { key: 'a22', title: 'Alpha two two', payload: 122 }
      ] }
    ] },
    { key: 'b', title: 'Beta', payload: 2, children: [
      { key: 'b1', title: 'Beta one', payload: 21 }
    ] },
    { key: 'c', title: 'Gamma', payload: 3 },
    { key: 'disabled', title: 'Disabled', payload: 4, disabled: true },
    { key: 0, title: 'Zero', payload: 5, children: [
      { key: 'z1', title: 'Zero one', payload: 51 },
      { key: 'z2', title: 'Zero two', payload: 52 }
    ] }
  ];
}

const start: TreeDragAction = { kind: 'dragstart', key: 'c', x: 100 };
const end: TreeDragAction = { kind: 'dragend', key: 'c' };
function drop(key: string | number, x = 100, y = 0.75): TreeDragAction[] {
  return [start, { kind: 'dragenter', key, x, y }, { kind: 'dragover', key, x, y },
    { kind: 'drop', key, x, y }, end];
}

export const treeDragSamples: TreeDragSample[] = [
  { id: 'collapse-source', actions: [
    { kind: 'dragstart', key: 'a', x: 100 }, { kind: 'dragend', key: 'a' }
  ] },
  { id: 'before-first', actions: drop('a', 100, 0.2) },
  { id: 'inside-expanded', actions: drop('a', 160) },
  { id: 'after-root', actions: drop('b') },
  { id: 'inside-collapsed', actions: drop('b', 160) },
  { id: 'after-child', actions: drop('a1') },
  { id: 'before-child', actions: drop('a2', 100, 0.2) },
  { id: 'inside-leaf', actions: drop('a1', 160) },
  { id: 'cross-level', actions: drop('a22', 20) },
  { id: 'cross-level-top', actions: drop('b', 20, 0.2) },
  { id: 'gap-fallback', allow: 'gap', actions: drop('b', 160) },
  { id: 'inside-only', allow: 'inside', actions: drop('b', 160) },
  { id: 'gap-denied', allow: 'inside', actions: drop('b') },
  { id: 'before-only', allow: 'before', actions: drop('a', 100, 0.2) },
  { id: 'all-denied', allow: 'never', actions: drop('b', 160) },
  { id: 'self-denied', actions: drop('c', 160) },
  { id: 'descendant-denied', controlled: 'reject', actions: [
    { kind: 'dragstart', key: 'a' }, { kind: 'dragenter', key: 'a21', x: 160 },
    { kind: 'dragover', key: 'a21', x: 160 }, { kind: 'drop', key: 'a21', x: 160 },
    { kind: 'dragend', key: 'a' }
  ] },
  { id: 'predicate', predicate: true, actions: drop('b', 160) },
  { id: 'hidden-handle', icon: 'hidden', actions: drop('b', 160) },
  { id: 'custom-handle', icon: 'custom', actions: drop('b', 160) },
  { id: 'empty-handle', icon: 'empty', actions: drop('b', 160) },
  { id: 'disabled-source', actions: [
    { kind: 'dragstart', key: 'disabled' }, { kind: 'dragenter', key: 'b', x: 160 },
    { kind: 'dragover', key: 'b', x: 160 }
  ] },
  { id: 'disabled-tree', disabled: true, actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'dragover', key: 'b', x: 160 }
  ] },
  { id: 'disabled-target', actions: drop('disabled', 160) },
  { id: 'rtl-inside', direction: 'rtl', actions: drop('b', 40) },
  { id: 'rtl-cross-level', direction: 'rtl', actions: drop('a22', 180) },
  { id: 'prefix', prefix: 'dense', localPrefix: 'branch', actions: drop('b', 160) },
  { id: 'custom-indent', indent: 36, actions: drop('a22', 56) },
  { id: 'zero-indent', indent: 0, actions: drop('b', 88) },
  { id: 'directory', directory: true, actions: [
    { kind: 'dragstart', key: 'a' }, { kind: 'dragenter', key: 'b', x: 160 },
    { kind: 'wait', milliseconds: 801 }, { kind: 'drop', key: 'b', x: 160 },
    { kind: 'dragend', key: 'a' }
  ] },
  { id: 'delayed-expand', actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'wait', milliseconds: 801 },
    { kind: 'dragend', key: 'c' }
  ] },
  { id: 'delayed-leaf', actions: [
    start, { kind: 'dragenter', key: 'a1', x: 160 }, { kind: 'wait', milliseconds: 801 }, end
  ] },
  { id: 'controlled-reject', controlled: 'reject', actions: [
    { kind: 'dragstart', key: 'a' }, { kind: 'dragenter', key: 'b', x: 160 },
    { kind: 'wait', milliseconds: 801 }, { kind: 'dragend', key: 'a' }
  ] },
  { id: 'controlled-accept', controlled: 'accept', actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'wait', milliseconds: 801 }, end
  ] },
  { id: 'leave', actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'dragleave', key: 'b', x: 160 }, end
  ] },
  { id: 'virtual', virtual: true, actions: [
    { kind: 'dragstart', key: 'v0' }, { kind: 'dragenter', key: 'v2', x: 160 },
    { kind: 'dragover', key: 'v2', x: 160 }, { kind: 'drop', key: 'v2', x: 160 },
    { kind: 'dragend', key: 'v0' }
  ] },
  { id: 'live-source-data', actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'payload' },
    { kind: 'dragover', key: 'b', x: 160 }, { kind: 'drop', key: 'b', x: 160 }, end
  ] },
  { id: 'mutated-event-data', mutateEvents: true, actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'wait', milliseconds: 801 },
    { kind: 'drop', key: 'b', x: 160 }, end
  ] }
];

export const treeDragObservations: TreeDragSample[] = [
  { id: 'stale-allow-observation', allow: 'live', actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'allow', value: false },
    { kind: 'dragover', key: 'b', x: 160 }, { kind: 'drop', key: 'b', x: 160 }, end
  ] },
  { id: 'window-end-observation', virtual: true, actions: [
    { kind: 'dragstart', key: 'v0' }, { kind: 'scroll', key: 'v30' }, { kind: 'windowend' }
  ] },
  { id: 'unmount-timer-observation', actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'unmount' },
    { kind: 'wait', milliseconds: 801 }
  ] },
  { id: 'zero-container-observation', expanded: ['a', 'a2', 0], actions: drop('z1') },
  { id: 'prefix-cache-observation', localPrefix: 'branch', actions: [
    start, { kind: 'dragenter', key: 'b', x: 160 }, { kind: 'prefix', value: 'fresh-tree' },
    { kind: 'dragover', key: 'b', x: 160 }, { kind: 'drop', key: 'b', x: 160 }, end
  ] },
  { id: 'late-descendant-observation', controlled: 'reject', actions: [
    { kind: 'dragstart', key: 'a' }, { kind: 'append-child' },
    { kind: 'dragenter', key: 'late', x: 160 }, { kind: 'dragover', key: 'late', x: 160 },
    { kind: 'drop', key: 'late', x: 160 }, { kind: 'dragend', key: 'a' }
  ] }
];

export const treeDragNativeSamples: TreeDragSample[] = [
  { id: 'native-check-focus', checkable: true, actions: [] },
  { id: 'native-handle-control', icon: 'control', actions: [] }
];
