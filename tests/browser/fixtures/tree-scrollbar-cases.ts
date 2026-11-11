export type TreeScrollbarMode = boolean | 'optional';
export type TreeScrollbarAction = 'idle' | 'hover' | 'idle-after-hover' | 'wheel' | 'scroll-to'
  | 'drag' | 'keyboard' | 'resize' | 'mode-true' | 'mode-false' | 'mode-optional' | 'mode-default' | 'idle-after-modes';
export interface TreeScrollbarSample {
  id: string;
  kind: 'tree-select' | 'select';
  mode?: TreeScrollbarMode;
  virtual?: boolean;
  count?: number;
  live?: boolean;
}
const modes = [undefined, true, false, 'optional'] as const;
export const treeScrollbarSamples: readonly TreeScrollbarSample[] = [
  ...(['tree-select', 'select'] as const).flatMap(kind => modes.map(mode => ({
    id: kind + '-' + String(mode ?? 'default'), kind, mode
  }))),
  ...modes.map(mode => ({ id: 'tree-select-nonvirtual-' + String(mode ?? 'default'),
    kind: 'tree-select' as const, mode, virtual: false })),
  { id: 'tree-select-fit', kind: 'tree-select', count: 2 },
  { id: 'tree-select-live', kind: 'tree-select', live: true }
];
export function treeScrollbarData(sample: TreeScrollbarSample) {
  return Array.from({ length: sample.count ?? 64 }, (_, index) => ({
    key: String(index), value: String(index), label: 'Item ' + index, title: 'Item ' + index
  }));
}
