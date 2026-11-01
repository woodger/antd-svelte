import { getContext, setContext } from 'svelte';
import type { CheckboxGroupValue } from './checkbox-group.types';

interface CheckboxGroupContext<Value extends CheckboxGroupValue = CheckboxGroupValue> {
  readonly value: readonly Value[];
  readonly defaultValue: readonly Value[];
  readonly name?: string;
  readonly form?: string | null;
  readonly disabled: boolean;
  register(input: HTMLInputElement, value: Value): () => void;
  toggle(value: Value, checked: boolean): void;
}

const groupKey = Symbol('ant-design-checkbox-group');

export function provideCheckboxGroup<Value extends CheckboxGroupValue>(
  group: CheckboxGroupContext<Value>
) {
  setContext(groupKey, group);
}

export function useCheckboxGroup(): CheckboxGroupContext | undefined {
  return getContext(groupKey);
}
