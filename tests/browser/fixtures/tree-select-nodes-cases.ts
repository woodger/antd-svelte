export interface TreeSelectNodeSpec {
  value: string | number;
  title?: string | number | null;
  label?: string;
  payload: string;
  children?: TreeSelectNodeSpec[];
  icon?: 'text' | 'state';
  switcher?: 'text' | 'state';
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  rich?: boolean;
}

export type TreeSelectNodesAction = 'open' | 'choose-zero' | 'choose-beta' | 'expand' | 'collapse'
  | 'search' | 'reset-search' | 'reverse' | 'update' | 'remove' | 'add'
  | 'data' | 'empty-data' | 'declarations' | 'resolve';

export interface TreeSelectNodesSample {
  id: string;
  data?: boolean;
  override?: 'data' | 'empty';
  simple?: boolean;
  aliases?: boolean;
  icons?: boolean | 'truthy';
  styled?: boolean;
  aria?: boolean;
  checkable?: boolean;
  strict?: boolean;
  lazy?: boolean;
  initiallyExpanded?: boolean;
  observation?: boolean;
  rich?: boolean;
  disabled?: boolean;
  closed?: boolean;
  long?: boolean;
  missingTitle?: boolean;
  flags?: boolean;
  actions?: readonly TreeSelectNodesAction[];
}

export const treeSelectNodesSamples: readonly TreeSelectNodesSample[] = [
  { id: 'declared', actions: ['choose-beta', 'open'] },
  { id: 'data', data: true, actions: ['choose-beta', 'open'] },
  { id: 'declared-simple', simple: true, actions: ['choose-beta'] },
  { id: 'data-wins', override: 'data' },
  { id: 'empty-data-wins', override: 'empty' },
  { id: 'aliases', aliases: true, actions: ['choose-beta', 'open', 'search', 'reset-search'] },
  { id: 'declared-icons', icons: true, actions: ['choose-beta', 'open', 'collapse', 'expand'] },
  { id: 'data-icons', data: true, icons: true, actions: ['choose-beta', 'open'] },
  { id: 'hidden-icons', icons: false, actions: ['choose-beta', 'open'] },
  { id: 'truthy-icon', icons: 'truthy', actions: ['choose-beta', 'open'] },
  { id: 'node-styles', styled: true, icons: true, actions: ['update'] },
  { id: 'node-aria', aria: true, actions: ['choose-beta'] },
  { id: 'checkable', checkable: true, actions: ['choose-beta', 'choose-zero'] },
  { id: 'strict', checkable: true, strict: true, actions: ['choose-beta', 'choose-zero'] },
  { id: 'live-order', actions: ['reverse', 'remove', 'add', 'update'] },
  { id: 'live-data', actions: ['data', 'empty-data', 'declarations'] },
  { id: 'lazy', lazy: true, icons: true, observation: true, actions: ['expand', 'resolve', 'choose-zero'] },
  { id: 'expanded-lazy', lazy: true, initiallyExpanded: true, icons: true, actions: ['resolve', 'choose-zero'] },
  { id: 'rich-title', rich: true, actions: ['choose-zero', 'open', 'update'] },
  { id: 'disabled', disabled: true },
  { id: 'closed', closed: true, actions: ['open', 'choose-beta'] },
  { id: 'long-declarations', long: true },
  { id: 'missing-title', missingTitle: true },
  { id: 'node-flags', checkable: true, flags: true }
];

export function treeSelectNodeSpecs(sample: TreeSelectNodesSample, revision = 0, reversed = false,
  removed = false, added = false, loaded = false): TreeSelectNodeSpec[] {
  if (sample.long) return Array.from({ length: 80 }, (_, value) => ({
    value, title: `Node ${value}`, payload: `item-${value}`, icon: 'text'
  }));
  if (sample.missingTitle) return [
    { value: 'untitled', payload: 'untitled' },
    { value: 'empty-title', title: '', payload: 'empty' },
    { value: 'zero-title', title: 0, payload: 'zero' },
    { value: 'null-title', title: null, payload: 'null' },
    { value: 'fallback', label: 'Label fallback', payload: 'fallback' }
  ];
  let children: TreeSelectNodeSpec[] = [
    { value: 0, title: revision ? 'Updated Zero' : 'Node Zero', payload: 'zero', icon: 'text', rich: sample.rich },
    { value: 'b', title: 'Node Beta', payload: 'beta', icon: 'state' },
    { value: 'd', title: 'Node Disabled', payload: 'disabled', disabled: true, icon: 'text' }
  ];
  if (sample.flags) {
    children[0].selectable = false;
    children[1].checkable = false;
  }
  if (removed) children = children.filter(node => node.value !== 'b');
  if (added) children.push({ value: 'new', title: 'Node New', payload: 'new', icon: 'text' });
  if (reversed) children.reverse();
  if (sample.lazy && !loaded) children = [];
  return [
    { value: 'p', title: 'Node Parent', payload: 'parent', icon: 'state', switcher: 'state',
      ...(sample.lazy ? { isLeaf: false } : {}), children },
    { value: 'tail', title: 'Node Tail', payload: 'tail', icon: 'text', switcher: 'text',
      ...(sample.checkable ? { disableCheckbox: true } : {}) }
  ];
}
