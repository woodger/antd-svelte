export type TreeSelectTriggerAction = 'focus' | 'focus-clear' | 'outside' | 'click-input' | 'click-root'
  | 'mouse-enter' | 'mouse-leave' | 'enable-focus-action' | 'disable' | 'enable' | 'update'
  | `down:${string}` | `up:${string}`;
export interface TreeSelectTriggerSample {
  id: string;
  showAction?: ('focus' | 'click')[];
  autoFocus?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  multiple?: boolean;
  defaultOpen?: boolean;
  controlledOpen?: 'accept' | 'reject';
  inputPrevent?: string;
  inputStop?: string;
  rootPrevent?: string;
  nativePrevent?: string;
  nativeOnly?: boolean;
  nativeAttributes?: boolean;
  insideRoot?: boolean;
  clear?: boolean;
  maxLength?: number;
  tabIndex?: number;
  actions: readonly TreeSelectTriggerAction[];
}
const choose: TreeSelectTriggerAction[] = ['focus', 'down:ArrowDown', 'up:ArrowDown', 'down:Enter', 'up:Enter', 'outside'];
export const treeSelectTriggerSamples: readonly TreeSelectTriggerSample[] = [
  { id: 'default', actions: choose },
  { id: 'focus-action', showAction: ['focus'], actions: choose },
  { id: 'click-action', showAction: ['click'], actions: ['focus', 'click-input', 'outside'] },
  { id: 'empty-actions', showAction: [], actions: ['focus', 'click-input', 'outside'] },
  { id: 'live-focus-action', actions: ['focus', 'enable-focus-action', 'outside', 'focus', 'outside'] },
  { id: 'autofocus', autoFocus: true, actions: ['update', 'outside', 'focus'] },
  { id: 'autofocus-open', autoFocus: true, showAction: ['focus'], actions: ['outside', 'focus', 'outside'] },
  { id: 'disabled-autofocus', autoFocus: true, showAction: ['focus'], disabled: true,
    actions: ['click-root', 'enable', 'focus', 'disable', 'outside'] },
  { id: 'readonly-space', readonly: true, actions: ['focus', 'down: ', 'up: ', 'outside'] },
  { id: 'readonly-printable', readonly: true, actions: ['focus', 'down:;', 'up:;', 'down:NumpadAdd', 'up:NumpadAdd', 'outside'] },
  { id: 'input-prevent-down', inputPrevent: 'ArrowDown', actions: choose },
  { id: 'input-prevent-enter', inputPrevent: 'Enter', actions: choose },
  { id: 'input-stop-down', inputStop: 'ArrowDown', actions: choose },
  { id: 'input-stop-enter', inputStop: 'Enter', actions: choose },
  { id: 'root-prevent-enter', rootPrevent: 'Enter', actions: choose },
  { id: 'root-mouse', actions: ['mouse-enter', 'click-input', 'mouse-leave', 'outside'] },
  { id: 'root-padding', actions: ['click-root', 'outside'] },
  { id: 'input-aliases', maxLength: 5, tabIndex: 3, actions: ['focus', 'outside'] },
  { id: 'controlled-accept', showAction: ['focus'], controlledOpen: 'accept', actions: choose },
  { id: 'controlled-reject', showAction: ['focus'], controlledOpen: 'reject', actions: ['focus', 'outside', 'focus', 'outside'] },
  { id: 'enter-lock', multiple: true, defaultOpen: true,
    actions: ['focus', 'down:Enter', 'down:Enter', 'up:Enter', 'down:Enter', 'up:Enter', 'outside'] },
  { id: 'clear-keyboard', clear: true, actions: ['focus-clear', 'down:Enter', 'up:Enter', 'outside'] },
  { id: 'native-key-cancel', nativeOnly: true, nativePrevent: 'ArrowDown', actions: choose },
  { id: 'native-attributes', nativeOnly: true, nativeAttributes: true,
    autoFocus: true, tabIndex: 3, maxLength: 5, actions: ['focus', 'outside'] },
  { id: 'native-inline-portal', nativeOnly: true, insideRoot: true, defaultOpen: true, actions: [] }
];
