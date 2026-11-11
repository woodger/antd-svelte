export type TreeSelectComponentsFormSlot = 'input' | 'root';
export type TreeSelectComponentsFormAction = 'field-focus' | 'type-query' | 'open' | 'select-beta' | 'unmount';
export interface TreeSelectComponentsFormSample {
  id: string;
  slot: TreeSelectComponentsFormSlot;
  actions: readonly TreeSelectComponentsFormAction[];
}
export const treeSelectComponentsFormSamples: readonly TreeSelectComponentsFormSample[] = [
  { id: 'input-composite', slot: 'input', actions: ['field-focus', 'type-query', 'open', 'select-beta', 'field-focus', 'unmount'] },
  { id: 'root-composite', slot: 'root', actions: ['field-focus', 'type-query', 'open', 'select-beta', 'field-focus', 'unmount'] }
];
