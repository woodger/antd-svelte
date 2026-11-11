export type TreeSelectInputKind = 'input' | 'textarea' | 'component-input' | 'component-textarea'
  | 'wrapped-input' | 'wrapped-textarea' | 'composite-input' | 'composite-textarea'
  | 'compatible-composite-input' | 'antd-input' | 'antd-textarea';
export interface TreeSelectInputUpdate {
  search?: string;
  searchable?: boolean;
  disabled?: boolean;
  tabIndex?: number;
  ownPhase?: number;
}
export interface TreeSelectInputAction {
  type: 'click' | 'focus' | 'ref-focus' | 'ref-blur' | 'fill' | 'key' | 'prefix-click' | 'outside'
    | 'composition-start' | 'composition-end' | 'paste' | 'update';
  text?: string;
  update?: TreeSelectInputUpdate;
}
export interface TreeSelectInputSample {
  id: string;
  input: TreeSelectInputKind;
  own?: 'callbacks' | 'attrs' | 'value' | 'value-undefined' | 'live';
  preventOwn?: boolean;
  multiple?: boolean;
  selected?: 'a' | readonly ['a'];
  label?: '' | '   ';
  controlled?: 'fixed' | 'accept';
  autoClear?: false;
  initialSearch?: string;
  searchable?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  defaultOpen?: boolean;
  separators?: readonly string[];
  actions: readonly TreeSelectInputAction[];
}
const focus = { type: 'focus' } as const;
const click = { type: 'click' } as const;
const blur = { type: 'ref-blur' } as const;
const fill = (text: string): TreeSelectInputAction => ({ type: 'fill', text });
const key = (text: string): TreeSelectInputAction => ({ type: 'key', text });
const update = (value: TreeSelectInputUpdate): TreeSelectInputAction => ({ type: 'update', update: value });
export const treeSelectInputSamples: readonly TreeSelectInputSample[] = [
  { id: 'intrinsic-input', input: 'input', actions: [{ type: 'ref-focus' }, fill('Beta'), key('ArrowDown'), blur] },
  { id: 'intrinsic-textarea', input: 'textarea', actions: [focus, key('ArrowDown'), key('ArrowUp'), key('ArrowLeft'), key('ArrowRight'), key('Enter'), blur] },
  { id: 'component-input', input: 'component-input', selected: 'a', actions: [click, fill('Beta'), fill(''), blur] },
  { id: 'component-textarea', input: 'component-textarea', actions: [focus, key('ArrowDown'), click, key('ArrowDown'), blur] },
  { id: 'wrapped-input', input: 'wrapped-input', actions: [{ type: 'ref-focus' }, { type: 'prefix-click' }, fill('Beta'), blur] },
  { id: 'wrapped-textarea', input: 'wrapped-textarea', actions: [{ type: 'ref-focus' }, key('ArrowDown'), { type: 'prefix-click' }, blur] },
  { id: 'composite-input', input: 'composite-input', actions: [{ type: 'ref-focus' }, { type: 'prefix-click' }, fill('Beta'), blur] },
  { id: 'composite-textarea', input: 'composite-textarea', actions: [{ type: 'ref-focus' }, key('ArrowDown'), blur] },
  { id: 'wrapped-multiple-pointer', input: 'wrapped-input', multiple: true, selected: ['a'], actions: [click, { type: 'prefix-click' }, click, click, blur] },
  { id: 'composite-multiple-pointer', input: 'compatible-composite-input', multiple: true, selected: ['a'], actions: [click, { type: 'prefix-click' }, click, blur] },
  { id: 'antd-input', input: 'antd-input', actions: [{ type: 'ref-focus' }, { type: 'prefix-click' }, fill('Beta'), blur] },
  { id: 'antd-textarea', input: 'antd-textarea', actions: [{ type: 'ref-focus' }, key('ArrowDown'), fill('Beta'), blur] },
  { id: 'own-input-attrs', input: 'input', own: 'attrs', disabled: true, searchable: false, autoFocus: true, actions: [focus, fill('Beta'), key('ArrowDown'), blur] },
  { id: 'own-textarea-attrs', input: 'textarea', own: 'attrs', autoFocus: true, actions: [focus, key('ArrowDown'), fill('Beta'), blur] },
  { id: 'own-input-value', input: 'component-input', own: 'value', selected: 'a', controlled: 'accept', actions: [click, fill('Beta'), blur] },
  { id: 'own-input-value-undefined', input: 'component-input', own: 'value-undefined', selected: 'a', controlled: 'accept',
    separators: [','], actions: [click, fill('Beta'), fill('Alpha,Beta'), blur, click] },
  { id: 'own-input-callbacks', input: 'component-input', own: 'callbacks', preventOwn: true, separators: ['\n'], actions: [focus, key('ArrowDown'), fill('Beta'),
    { type: 'composition-start' }, fill('Alpha'), { type: 'composition-end' }, { type: 'paste', text: 'Alpha\nBeta' }, fill('Alpha Beta'), blur] },
  { id: 'own-textarea-callbacks', input: 'component-textarea', own: 'callbacks', preventOwn: true, actions: [focus, key('ArrowDown'), fill('Beta'),
    { type: 'composition-start' }, fill('Alpha'), { type: 'composition-end' }, blur] },
  { id: 'multiple-input', input: 'component-input', multiple: true, selected: ['a'], actions: [click, fill('Beta'), blur] },
  { id: 'multiple-textarea', input: 'component-textarea', multiple: true, selected: ['a'], actions: [focus, key('ArrowDown'), click, fill('Beta'), blur] },
  { id: 'controlled-fixed', input: 'component-input', controlled: 'fixed', initialSearch: 'Alpha', actions: [click, fill('Beta'), blur, click] },
  { id: 'controlled-accept', input: 'component-textarea', controlled: 'accept', selected: 'a', actions: [click, fill('Beta'), blur, click] },
  { id: 'multiple-controlled-clear', input: 'component-input', controlled: 'fixed', multiple: true, selected: ['a'],
    initialSearch: 'Alpha', actions: [click, fill('Beta'), blur, click] },
  { id: 'multiple-controlled-retain', input: 'component-input', controlled: 'fixed', multiple: true, selected: ['a'],
    autoClear: false, initialSearch: 'Alpha', actions: [click, fill('Beta'), blur, click] },
  { id: 'component-ime', input: 'component-input', separators: [','], actions: [click, { type: 'composition-start' }, fill('Alpha,Beta'), { type: 'composition-end' }] },
  { id: 'component-paste', input: 'component-input', separators: ['\n'], actions: [click, { type: 'paste', text: 'Alpha\r\nBeta' }, fill('Alpha Beta')] },
  { id: 'live-generated-props', input: 'component-input', controlled: 'accept', selected: 'a', actions: [focus, fill('Beta'), update({ search: 'Alpha', tabIndex: 7 }),
    update({ searchable: false }), update({ searchable: true }), update({ disabled: true }), update({ disabled: false }), { type: 'ref-focus' }] },
  { id: 'live-own-props', input: 'component-input', own: 'live', controlled: 'accept', actions: [click, fill('Beta'), update({ ownPhase: 1 }),
    update({ search: 'Alpha' }), update({ ownPhase: 0 }), blur] },
  { id: 'readonly', input: 'component-textarea', searchable: false, actions: [focus, key('ArrowDown'), click, blur] },
  { id: 'disabled', input: 'component-input', disabled: true, actions: [{ type: 'ref-focus' }] },
  { id: 'autofocus', input: 'component-input', autoFocus: true, actions: [blur, { type: 'ref-focus' }] },
  { id: 'empty-label', input: 'component-input', selected: 'a', label: '', actions: [click, fill('Beta'), fill(''), blur] },
  { id: 'blank-label', input: 'component-input', selected: 'a', label: '   ', actions: [click, fill('Beta'), fill(''), blur] },
];
