export type TreeSelectRootKind = 'button' | 'input' | 'component-button' | 'component-input' | 'composite' | 'container';
export type TreeSelectRootAction = 'click' | 'click-only' | 'outside' | 'focus' | 'blur'
  | 'ref-focus' | 'ref-blur' | 'type' | 'enter' | 'space' | 'arrow-down' | 'unmount'
  | 'child-focus' | 'child-type' | 'child-enter';
export interface TreeSelectRootSample {
  id: string;
  root: TreeSelectRootKind;
  own?: boolean;
  disabled?: boolean;
  ownDisabled?: boolean;
  prevent?: 'generated' | 'own';
  showAction?: ('focus' | 'click')[];
  controlled?: 'accept-closed' | 'accept-open' | 'hold-closed' | 'hold-open';
  defaultOpen?: boolean;
  both?: boolean;
  actions: readonly TreeSelectRootAction[];
}
export const treeSelectRootSamples: readonly TreeSelectRootSample[] = [
  { id: 'intrinsic-button', root: 'button', actions: ['click', 'click', 'ref-focus', 'ref-blur'] },
  { id: 'intrinsic-input', root: 'input', actions: ['click', 'type', 'click', 'ref-blur'] },
  { id: 'component-button', root: 'component-button', actions: ['click', 'click', 'outside'] },
  { id: 'component-input', root: 'component-input', actions: ['ref-focus', 'type', 'enter', 'outside'] },
  { id: 'own-button', root: 'button', own: true, actions: ['click', 'click', 'ref-blur'] },
  { id: 'own-input', root: 'input', own: true, actions: ['ref-focus', 'type', 'click', 'ref-blur'] },
  { id: 'composite', root: 'composite', own: true, actions: ['ref-focus', 'type', 'click', 'ref-blur'] },
  { id: 'generated-prevent', root: 'button', own: true, prevent: 'generated', actions: ['click', 'enter', 'ref-blur'] },
  { id: 'own-prevent', root: 'button', own: true, prevent: 'own', actions: ['click', 'enter', 'ref-blur'] },
  { id: 'own-component-button', root: 'component-button', own: true, actions: ['click', 'click', 'ref-focus', 'ref-blur'] },
  { id: 'own-component-input', root: 'component-input', own: true, actions: ['ref-focus', 'type', 'enter', 'ref-blur'] },
  { id: 'disabled-button', root: 'button', disabled: true, actions: ['click', 'enter', 'space', 'ref-blur'] },
  { id: 'disabled-input', root: 'input', disabled: true, actions: ['click', 'type', 'enter', 'ref-blur'] },
  { id: 'disabled-composite', root: 'composite', own: true, disabled: true, actions: ['click', 'type', 'enter', 'ref-blur'] },
  { id: 'own-disabled', root: 'button', own: true, ownDisabled: true, actions: ['ref-focus', 'click-only', 'ref-blur'] },
  ...(['accept-closed', 'accept-open', 'hold-closed', 'hold-open'] as const).map(controlled => ({
    id: `controlled-${controlled}`, root: 'button' as const, own: true, controlled,
    actions: ['click', 'click', 'outside'] as const
  })),
  ...([[], ['click'], ['focus'], ['focus', 'click']] as const).map((showAction, index) => ({
    id: `show-action-${['none', 'click', 'focus', 'both'][index]}`, root: 'button' as const,
    own: true, showAction: [...showAction], actions: ['focus', 'outside', 'click', 'click', 'ref-blur'] as const
  })),
  { id: 'both-slots', root: 'button', own: true, both: true, actions: ['click', 'click', 'ref-blur'] },
  { id: 'both-composite', root: 'composite', own: true, both: true, actions: ['click', 'type', 'ref-blur'] },
  { id: 'default-open', root: 'button', defaultOpen: true, actions: ['ref-focus', 'click', 'click', 'outside'] },
  { id: 'button-keyboard', root: 'button', own: true, actions: ['arrow-down', 'space', 'enter'] },
  { id: 'input-keyboard', root: 'input', own: true, actions: ['arrow-down', 'space', 'enter'] },
  { id: 'composite-unmount', root: 'composite', own: true, actions: ['ref-focus', 'type', 'unmount'] },
  { id: 'nested-container', root: 'container', own: true, showAction: ['focus'],
    actions: ['child-focus', 'child-type', 'child-enter', 'outside', 'ref-focus', 'ref-blur'] },
];
