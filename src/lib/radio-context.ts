import { getContext, setContext } from 'svelte';
import type { RadioChangeEvent, RadioValue } from './radio.types';

interface RadioGroupContext<Value extends RadioValue = RadioValue> {
  readonly value: Value | undefined;
  readonly defaultValue: Value | undefined;
  readonly name: string;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly optionType?: 'default' | 'button';
  readonly block?: boolean;
  register(input: HTMLInputElement, value: Value): () => void;
  select(value: Value, event: RadioChangeEvent): void;
}

const groupKey = Symbol('ant-design-radio-group');
const optionTypeKey = Symbol('ant-design-radio-option-type');

export function provideRadioGroup<Value extends RadioValue>(group: RadioGroupContext<Value>) {
  setContext(groupKey, group);
}

export function useRadioGroup(): RadioGroupContext | undefined {
  return getContext(groupKey);
}

export function provideRadioOptionType(value: 'button') {
  setContext(optionTypeKey, value);
}

export function useRadioOptionType(): 'button' | undefined {
  return getContext(optionTypeKey);
}
