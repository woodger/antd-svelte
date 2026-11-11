export const treeSelectControlSlots = [
  'root', 'prefix', 'input', 'suffix', 'clear', 'content', 'placeholder', 'item', 'itemContent', 'itemRemove'
] as const;
export const treeSelectPopupSlots = ['root', 'item', 'itemTitle', 'itemSwitcher'] as const;
type Slots<Key extends string, Value> = Partial<Record<Key, Value>>;
type ControlSlot = typeof treeSelectControlSlots[number];
type PopupSlot = typeof treeSelectPopupSlots[number];
export type SemanticStyles = Slots<ControlSlot, Record<string, string | number>> & {
  popup?: Slots<PopupSlot, Record<string, string | number>>;
};
export type SemanticClasses = Slots<ControlSlot, string> & { popup?: string | Slots<PopupSlot, string>; };
export type SemanticRecord = 'object' | 'callback' | 'shorthand' | 'plain';
export type Switcher = 'render' | 'array' | false | 0 | null;
export type TreeSelectSemanticAction = 'open' | 'search' | 'reset-search' | 'expand'
  | 'collapse' | 'load' | 'finish-load' | 'draft' | 'update' | 'outside';

export interface TreeSelectSemanticSample {
  id: string;
  local?: Exclude<SemanticRecord, 'plain'>;
  provider?: SemanticRecord;
  nested?: 'inherit' | 'replace' | 'reset';
  multiple?: boolean;
  value?: string | string[];
  tags?: 'summary' | 'custom';
  placeholder?: 'text' | 'rich';
  affixes?: boolean;
  initialOpen?: boolean;
  disabled?: boolean;
  form?: boolean;
  explicitSize?: 'medium';
  rtl?: boolean;
  popupWidth?: 'style' | 'number' | 'bounds';
  customPopup?: boolean;
  switcher?: Switcher;
  lines?: true | { leaf: Switcher | true; };
  lazy?: boolean;
  actions?: readonly TreeSelectSemanticAction[];
}

export const treeSelectSemanticSamples: readonly TreeSelectSemanticSample[] = [
  { id: 'single-empty', local: 'object', provider: 'object', placeholder: 'text', affixes: true,
    actions: ['open', 'search', 'reset-search'] },
  { id: 'placeholder-omitted', local: 'object' },
  { id: 'placeholder-rich', local: 'object', placeholder: 'rich', initialOpen: true },
  { id: 'single-selected', local: 'object', value: 'a', placeholder: 'text', affixes: true },
  { id: 'multiple-summary', local: 'object', provider: 'object', multiple: true, value: ['a', 'b', 'c'],
    tags: 'summary', affixes: true, initialOpen: true },
  { id: 'multiple-custom', local: 'object', provider: 'object', multiple: true, value: ['a', 'b', 'c'],
    tags: 'custom' },
  { id: 'multiple-placeholder', local: 'object', multiple: true, placeholder: 'text',
    actions: ['open', 'search', 'reset-search'] },
  { id: 'provider-shorthand', local: 'object', provider: 'shorthand', initialOpen: true },
  { id: 'local-shorthand', local: 'shorthand', provider: 'object', initialOpen: true },
  { id: 'provider-inherited', provider: 'object', nested: 'inherit', initialOpen: true },
  { id: 'provider-replaced', provider: 'object', nested: 'replace', initialOpen: true },
  { id: 'provider-reset', provider: 'object', nested: 'reset', initialOpen: true },
  { id: 'provider-plain-fields', provider: 'plain', initialOpen: true },
  { id: 'callbacks-default', local: 'callback', provider: 'callback', value: 'a',
    actions: ['open'] },
  { id: 'callbacks-form', local: 'callback', provider: 'callback', form: true,
    initialOpen: true, disabled: false, explicitSize: 'medium', rtl: true },
  { id: 'callbacks-disabled', local: 'callback', provider: 'callback', form: true },
  { id: 'popup-live', local: 'callback', provider: 'object', customPopup: true,
    initialOpen: true, popupWidth: 'style', actions: ['draft', 'update', 'outside', 'open'] },
  { id: 'popup-numeric-width', local: 'object', provider: 'object', initialOpen: true, popupWidth: 'number' },
  { id: 'popup-bounds', local: 'callback', provider: 'object', initialOpen: true, popupWidth: 'bounds',
    actions: ['update'] },
  { id: 'switcher-provider', provider: 'object', switcher: null, lines: true, lazy: true,
    initialOpen: true, actions: ['collapse', 'expand', 'load', 'finish-load'] },
  { id: 'switcher-render', local: 'object', provider: 'object', switcher: 'render',
    lines: { leaf: 'render' }, initialOpen: true },
  { id: 'switcher-array', provider: 'object', switcher: 'array', lines: { leaf: 'array' }, initialOpen: true },
  { id: 'switcher-false', provider: 'object', switcher: false, lines: { leaf: true }, initialOpen: true },
  { id: 'switcher-zero', provider: 'object', switcher: 0, lines: { leaf: 0 }, initialOpen: true }
];

export interface SemanticTreeNode {
  code: string;
  label: string;
  nodes?: SemanticTreeNode[];
  disabled?: boolean;
  isLeaf?: boolean;
}
export function treeSelectSemanticData(lazy = false): SemanticTreeNode[] {
  const data = [{ code: 'p', label: 'Parent', nodes: [
    { code: 'a', label: 'Alpha' }, { code: 'b', label: 'Beta', disabled: true }, { code: 'c', label: 'Gamma' }
  ] }];
  return lazy ? [...data, { code: 'lazy', label: 'Lazy', isLeaf: false }] : data;
}
export const treeSelectSemanticFields = { value: 'code', label: 'label', children: 'nodes' };

export function treeSelectSemanticRecord(layer: string, shorthand = false) {
  const classes: SemanticClasses = Object.fromEntries(treeSelectControlSlots.map(slot => [slot, `semantic-${layer}-${slot}`]));
  const styles: SemanticStyles = Object.fromEntries(treeSelectControlSlots.map(slot => [slot, {
    [`--semantic-${layer}`]: slot, '--semantic-priority': layer
  }]));
  classes.popup = shorthand ? `semantic-${layer}-popup-root` : Object.fromEntries(treeSelectPopupSlots
    .map(slot => [slot, `semantic-${layer}-popup-${slot}`]));
  styles.popup = Object.fromEntries(treeSelectPopupSlots.map(slot => [slot, {
    [`--semantic-${layer}`]: `popup-${slot}`, '--semantic-popup-priority': layer
  }]));
  return { classes, styles };
}

export function treeSelectSemanticLayers(sample: TreeSelectSemanticSample) {
  const provider = treeSelectSemanticRecord('provider', sample.provider === 'shorthand');
  const local = treeSelectSemanticRecord('local', sample.local === 'shorthand');
  const updated = treeSelectSemanticRecord('updated');
  const inner = treeSelectSemanticRecord('inner');
  if (sample.popupWidth === 'bounds') {
    Object.assign(local.styles.popup!.root!, { minWidth: 100, maxWidth: 192 });
    Object.assign(updated.styles.popup!.root!, { minWidth: 100 });
  } else if (sample.popupWidth) {
    Object.assign(local.styles.popup!.root!, { width: 192, zIndex: 1266 });
    if (sample.popupWidth === 'number') Object.assign(local.styles.popup!.root!, { minWidth: 120, maxWidth: 270 });
    Object.assign(local.styles.root!, { zIndex: 1234 });
  }
  return { provider, local, updated, inner };
}

export function treeSelectSemanticInfo(props: {
  size?: string; status?: string; disabled?: boolean; variant?: string;
  open?: boolean; defaultOpen?: boolean; defaultValue?: unknown; treeData?: readonly unknown[];
}, data: readonly unknown[]) {
  return JSON.stringify({ size: props.size ?? null, status: props.status ?? null, disabled: props.disabled,
    variant: props.variant, open: props.open ?? null, defaultOpen: props.defaultOpen ?? null,
    defaultValue: props.defaultValue ?? null, dataIdentity: props.treeData === data });
}
