export interface TreeSelectTokenAction {
  type: 'focus' | 'open' | 'fill' | 'outside' | 'composition-start' | 'composition-end' | 'paste';
  text?: string;
}
export interface TreeSelectTokenSample {
  id: string;
  separators?: readonly string[];
  splitter?: 'csv' | 'empty' | 'unchanged' | 'lines';
  multiple?: boolean;
  checked?: boolean;
  strategy?: 'SHOW_PARENT';
  maxCount?: number;
  selected?: string[];
  controlled?: 'fixed' | 'accept';
  reentrant?: boolean;
  defaultOpen?: boolean;
  initialSearch?: string;
  closeOnSearch?: boolean;
  actions: readonly TreeSelectTokenAction[];
}
const open = { type: 'open' } as const;
const fill = (text: string): TreeSelectTokenAction => ({ type: 'fill', text });
export const treeSelectTokenSamples: readonly TreeSelectTokenSample[] = [
  { id: 'single-comma', separators: [','], actions: [open, fill('Alpha,Beta')] },
  { id: 'single-progressive', separators: [','], actions: [open, fill('Alpha'), fill('Alpha,Beta')] },
  { id: 'multiple-comma', separators: [','], multiple: true, selected: ['a'], actions: [open, fill('Beta,Alpha')] },
  { id: 'ordinary-input', actions: [open, fill('Beta'), fill('')] },
  { id: 'empty-separators', separators: [], actions: [open, fill('a,b')] },
  { id: 'empty-first', separators: ['', ','], actions: [open, fill('a,b')] },
  { id: 'only-delimiters', separators: [','], actions: [open, fill(',,')] },
  { id: 'multiple-separators', separators: ['::', ','], actions: [open, fill('Alpha::Beta,')] },
  { id: 'functional-csv', splitter: 'csv', actions: [open, fill('Alpha,Beta')] },
  { id: 'functional-empty', splitter: 'empty', actions: [open, fill('Alpha,Beta')] },
  { id: 'functional-unchanged', splitter: 'unchanged', actions: [open, fill('Alpha,Beta')] },
  { id: 'composition', separators: [','], actions: [open, { type: 'composition-start' }, fill('Alpha,Beta'), { type: 'composition-end' }] },
  { id: 'paste-newline', separators: ['\n'], actions: [open, { type: 'paste', text: 'Alpha\nBeta' }, fill('Alpha Beta')] },
  { id: 'paste-functional', splitter: 'lines', actions: [open, { type: 'paste', text: 'Alpha\r\nBeta' }, fill('Alpha Beta')] },
  { id: 'count-zero', separators: [','], multiple: true, maxCount: 0, actions: [open, fill('Alpha,Beta')] },
  { id: 'count-full', splitter: 'csv', multiple: true, selected: ['a'], maxCount: 1, actions: [open, fill('Beta,Alpha')] },
  { id: 'count-show-parent', separators: [','], checked: true, strategy: 'SHOW_PARENT',
    selected: ['a'], maxCount: 1, actions: [open, fill('Beta'), fill('Beta,Alpha')] },
  { id: 'controlled-fixed', separators: [','], controlled: 'fixed', actions: [open, fill('Alpha'), fill('Alpha,Beta')] },
  { id: 'controlled-accept', separators: [','], controlled: 'accept', actions: [open, fill('Alpha'), fill('Alpha,Beta')] },
  { id: 'reentrant-search-focus', separators: [','], reentrant: true,
    actions: [{ type: 'focus' }, fill('Alpha'), fill('Alpha,Beta')] },
  { id: 'paste-before-composition-end', separators: ['\n'], actions: [open,
    { type: 'paste', text: 'Alpha\nBeta' }, { type: 'composition-end' }, fill('Alpha Beta')] },
  { id: 'initial-open-functional', splitter: 'csv', defaultOpen: true, actions: [fill('Alpha,Beta')] },
  { id: 'initial-open-close-on-search', controlled: 'fixed', initialSearch: 'Alpha', closeOnSearch: true, actions: [open] }
];
