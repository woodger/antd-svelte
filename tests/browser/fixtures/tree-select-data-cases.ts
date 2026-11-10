export interface TreeSelectDataSchema {
  value?: string;
  label?: string;
  children?: string;
}
export interface TreeSelectDataSimple {
  id?: string | number;
  pId?: string | number;
  rootPId?: string | number | null;
}
export type TreeSelectDataAction = { kind: 'open'; }
  | { kind: 'choose'; value: string | number; }
  | { kind: 'remove'; label: string; }
  | { kind: 'search'; value: string; }
  | { kind: 'update'; } | { kind: 'schema'; } | { kind: 'nested'; };
export interface TreeSelectDataSample {
  id: string;
  fields?: TreeSelectDataSchema;
  simple?: boolean | TreeSelectDataSimple;
  multiple?: boolean;
  checkable?: boolean;
  strict?: boolean;
  strategy?: 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';
  value?: unknown;
  controlled?: 'accept' | 'hold';
  labelProp?: string;
  labelKind?: 'null' | 'array' | 'missing';
  filterProp?: string;
  filter?: 'off' | 'custom';
  search?: boolean;
  renderer?: boolean;
  labeled?: boolean;
  rtl?: boolean;
  shadows?: boolean;
  rootZero?: boolean;
  unordered?: boolean;
  existingChildren?: boolean;
  actions?: readonly TreeSelectDataAction[];
}
export const treeSelectAliasFields = { value: 'code', label: 'caption', children: 'nodes' };
const choose: readonly TreeSelectDataAction[] = [
  { kind: 'open' }, { kind: 'choose', value: 2 }, { kind: 'open' }, { kind: 'choose', value: 0 }
];
export const treeSelectDataSamples: readonly TreeSelectDataSample[] = [
  { id: 'canonical', value: 1, actions: choose },
  { id: 'aliases', fields: treeSelectAliasFields, value: 1, actions: choose },
  { id: 'value-field', fields: { value: 'code' }, value: 1, actions: choose },
  { id: 'label-field', fields: { label: 'caption' }, value: 1, actions: choose },
  { id: 'children-field', fields: { children: 'nodes' }, value: 1, actions: choose },
  { id: 'empty-fields', fields: { value: '', label: '', children: '' }, value: 1, actions: choose },
  { id: 'canonical-shadows', fields: treeSelectAliasFields, shadows: true, value: 1, actions: choose },
  { id: 'label-prop', fields: treeSelectAliasFields, labelProp: 'secondary', value: 1, actions: choose },
  { id: 'null-label', labelKind: 'null', value: 1, actions: choose },
  { id: 'array-label', labelKind: 'array', value: 1, actions: choose },
  { id: 'missing-label', labelKind: 'missing', value: 1, actions: choose },
  { id: 'multiple', fields: treeSelectAliasFields, multiple: true, value: [1], actions: [
    { kind: 'open' }, { kind: 'choose', value: 2 }, { kind: 'remove', label: 'Alpha' }
  ] },
  ...(['SHOW_CHILD', 'SHOW_PARENT', 'SHOW_ALL'] as const).map(strategy => ({
    id: `check-${strategy}`, fields: treeSelectAliasFields, checkable: true, strategy,
    actions: [{ kind: 'open' }, { kind: 'choose', value: 0 }] as const
  })),
  { id: 'strict', fields: treeSelectAliasFields, strict: true,
    value: [{ value: 0, halfChecked: true }, { value: 1 }], actions: [
      { kind: 'open' }, { kind: 'choose', value: 2 }, { kind: 'remove', label: 'Alpha' }
    ] },
  { id: 'search-label', fields: treeSelectAliasFields, filterProp: 'caption', search: true, actions: [
    { kind: 'open' }, { kind: 'search', value: 'Alpha' }, { kind: 'choose', value: 1 }
  ] },
  { id: 'search-literal-value', fields: treeSelectAliasFields, search: true, actions: [
    { kind: 'open' }, { kind: 'search', value: '1' }
  ] },
  { id: 'custom-filter', fields: treeSelectAliasFields, filter: 'custom', search: true, actions: [
    { kind: 'open' }, { kind: 'search', value: 'Alpha' }, { kind: 'choose', value: 1 }
  ] },
  { id: 'filter-off', fields: treeSelectAliasFields, filter: 'off', search: true, actions: [
    { kind: 'open' }, { kind: 'search', value: 'unmatched' }
  ] },
  { id: 'simple', simple: true, value: 1, actions: choose },
  { id: 'simple-config', simple: { id: 'uid', pId: 'parent', rootPId: 'ROOT' }, value: 1, actions: choose },
  { id: 'simple-root-zero', simple: { rootPId: 0 }, rootZero: true, value: 2, actions: [
    { kind: 'open' }, { kind: 'choose', value: 1 }
  ] },
  { id: 'simple-unordered', simple: true, unordered: true, value: 1, actions: choose },
  { id: 'simple-aliases', simple: true, fields: { value: 'code', label: 'caption' }, value: 1, actions: choose },
  { id: 'simple-children-field', simple: true, fields: treeSelectAliasFields, value: 0, actions: [
    { kind: 'open' }, { kind: 'choose', value: 0 }
  ] },
  { id: 'controlled-hold', fields: treeSelectAliasFields, controlled: 'hold', value: 1, actions: choose },
  { id: 'data-update', fields: treeSelectAliasFields, controlled: 'accept', value: 1, actions: [
    { kind: 'update' }, { kind: 'open' }, { kind: 'choose', value: 2 }
  ] },
  { id: 'schema-update', controlled: 'accept', value: 1, actions: [
    { kind: 'open' }, { kind: 'schema' }, { kind: 'choose', value: 2 }
  ] },
  { id: 'simple-to-nested', simple: true, value: 1, actions: [
    { kind: 'open' }, { kind: 'nested' }, { kind: 'choose', value: 2 }
  ] },
  { id: 'generic-renderer', fields: treeSelectAliasFields, renderer: true, labeled: true, value: { value: 1 }, search: true,
    filterProp: 'caption', actions: [{ kind: 'open' }, { kind: 'search', value: 'Alpha' }] },
  { id: 'rtl', fields: treeSelectAliasFields, rtl: true, value: 1, actions: choose }
];

export const treeSelectDataObservations: readonly TreeSelectDataSample[] = [
  { id: 'simple-input-mutation', simple: true, existingChildren: true, value: 1,
    actions: [{ kind: 'open' }] },
  { id: 'raw-renderer-data', fields: treeSelectAliasFields, renderer: true, value: 1,
    actions: [{ kind: 'open' }] }
];

export function treeSelectData(
  sample: TreeSelectDataSample,
  fields = sample.fields,
  revision = 0,
  simple = sample.simple
): Record<string, unknown>[] {
  const valueField = fields?.value || 'value';
  const labelField = fields?.label || 'title';
  const childrenField = fields?.children || 'children';
  const make = (value: number | string, label: string): Record<string, unknown> => ({
    [valueField]: value, [labelField]: revision ? `${label} updated` : label,
    secondary: `Secondary ${label}`, payload: { value, ordinal: typeof value === 'number' ? value + 40 : 49 },
    ...(sample.shadows ? { value: `shadow-${value}`, key: value, title: 'Raw title', children: [] } : {}),
    ...(sample.shadows ? { [valueField]: value, [labelField]: label } : {})
  });
  const root = make(sample.rootZero ? 1 : 0, 'Parent');
  const alpha = make(sample.rootZero ? 2 : 1, 'Alpha');
  const beta = make(sample.rootZero ? 3 : 2, 'Beta');
  const locked: Record<string, unknown> = { ...make(sample.rootZero ? 4 : 3, 'Locked'), disabled: true };
  const tail = make('tail', 'Tail');
  if (sample.labelKind === 'null') { alpha[labelField] = null; alpha.label = 'Ignored fallback'; }
  if (sample.labelKind === 'array') alpha[labelField] = ['Alpha', 0, null, false, ' one'];
  if (sample.labelKind === 'missing') delete alpha[labelField];
  if (!simple) return [{ ...root, [childrenField]: [alpha, beta, locked] }, tail];
  const config = { id: 'id', pId: 'pId', rootPId: null, ...(typeof simple === 'object' ? simple : {}) };
  const rows = [root, alpha, beta, locked, tail];
  for (const node of rows) {
    node[String(config.id)] = node[valueField];
    node[String(config.pId)] = node === root || node === tail ? config.rootPId : root[valueField];
  }
  if (sample.existingChildren) root.children = [{ value: 'existing', title: 'Existing', payload: { ordinal: 90 } }];
  return sample.unordered ? [beta, alpha, tail, root, locked] : rows;
}
