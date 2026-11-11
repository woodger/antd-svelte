export type TreeSelectPointerTarget = 'root' | 'content' | 'label' | 'prefix' | 'suffix' | 'input';
export type TreeSelectPointerAction = TreeSelectPointerTarget | 'focus' | 'outside' | 'query' | 'caret'
  | 'clear-pointer' | 'clear-click' | 'touch-cancel' | 'touch-scroll' | 'node-mousedown' | 'draft';
export interface TreeSelectPointerSample {
  id: string;
  search?: boolean | 'object';
  multiple?: boolean;
  checked?: boolean;
  disabled?: boolean;
  showAction?: ('focus' | 'click')[];
  controlled?: 'accept-closed' | 'accept-open' | 'reject-closed' | 'reject-open';
  defaultOpen?: boolean;
  defaultSuffix?: boolean;
  touch?: boolean;
  prefixButton?: boolean;
  clear?: boolean;
  nativeSearchDefault?: boolean;
  insideRoot?: boolean;
  draft?: boolean;
  actions: readonly TreeSelectPointerAction[];
}
const targets: readonly TreeSelectPointerAction[] = ['root', 'root', 'content', 'content',
  'prefix', 'prefix', 'suffix', 'suffix', 'label', 'label', 'input', 'input'];
export const treeSelectPointerSamples: readonly TreeSelectPointerSample[] = [
  { id: 'single-default', actions: targets },
  { id: 'single-readonly', search: false, actions: targets },
  { id: 'single-search', search: true, actions: targets },
  { id: 'single-search-object', search: 'object', actions: targets },
  { id: 'multiple-default', multiple: true, actions: targets },
  { id: 'multiple-readonly', multiple: true, search: false, actions: targets },
  { id: 'checked-default', checked: true, actions: targets },
  { id: 'checked-readonly', checked: true, search: false, actions: targets },
  ...(['accept-closed', 'accept-open', 'reject-closed', 'reject-open'] as const)
    .map(controlled => ({ id: `controlled-${controlled}`, controlled, actions: targets })),
  { id: 'disabled', disabled: true, actions: targets },
  { id: 'default-open', defaultOpen: true, actions: targets },
  { id: 'multiple-default-open', multiple: true, defaultOpen: true, actions: targets },
  { id: 'default-suffix', defaultSuffix: true, actions: ['suffix', 'suffix', 'input', 'input'] },
  { id: 'prefix-button', prefixButton: true, actions: ['prefix', 'prefix', 'input', 'prefix'] },
  { id: 'clear-single', clear: true, actions: ['root', 'clear-pointer'] },
  { id: 'clear-search', clear: true, search: true, actions: ['root', 'clear-pointer'] },
  { id: 'clear-multiple', clear: true, multiple: true, actions: ['root', 'clear-pointer'] },
  { id: 'clear-click-only', clear: true, actions: ['root', 'clear-click'] },
  { id: 'show-action-none', showAction: [], actions: ['focus', 'outside', ...targets] },
  { id: 'show-action-click', showAction: ['click'], actions: ['focus', 'outside', ...targets] },
  { id: 'show-action-focus', showAction: ['focus'], actions: ['focus', 'outside', ...targets] },
  { id: 'show-action-both', showAction: ['focus', 'click'], actions: ['focus', 'outside', ...targets] },
  { id: 'touch-readonly', touch: true, search: false, actions: targets },
  { id: 'touch-search', touch: true, search: true, actions: targets },
  { id: 'touch-multiple', touch: true, multiple: true, actions: targets },
  { id: 'touch-checked', touch: true, checked: true, actions: targets },
  { id: 'touch-cancel', touch: true, actions: ['touch-cancel', 'root', 'root'] },
  { id: 'touch-scroll', touch: true, actions: ['touch-scroll', 'root', 'root'] },
  { id: 'touch-clear', touch: true, clear: true, actions: ['root', 'clear-pointer'] },
  { id: 'native-default-multiple-search', multiple: true, search: true, nativeSearchDefault: true, actions: targets },
  { id: 'native-default-checked-search', checked: true, search: true, nativeSearchDefault: true, actions: targets },
  { id: 'native-default-touch-search', multiple: true, touch: true, search: true, nativeSearchDefault: true, actions: targets },
  { id: 'popup-inside-menu', multiple: true, insideRoot: true, defaultOpen: true, actions: ['node-mousedown'] },
  { id: 'popup-inside-draft', multiple: true, insideRoot: true, draft: true, defaultOpen: true, actions: ['focus', 'draft'] },
  { id: 'search-caret', search: true, actions: ['query', 'caret', 'prefix', 'root', 'suffix', 'input', 'prefix'] }
];
