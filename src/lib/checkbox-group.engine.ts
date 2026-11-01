import type { CheckboxGroupOption, CheckboxGroupValue } from './checkbox-group.types';

export function getCheckboxGroupOptions<Value extends CheckboxGroupValue>(
  options: readonly (Value | CheckboxGroupOption<Value> | null | undefined)[]
): CheckboxGroupOption<Value>[] {
  const seen = new Set<Value>();

  return options.flatMap((option) => {
    if (option === null || option === undefined) return [];

    const item = typeof option === 'object' ? option : { value: option, label: String(option) };

    if (item.value === null || item.value === undefined || seen.has(item.value)) return [];

    seen.add(item.value);
    return [item];
  });
}

/** Source Group хранит raw state отдельно от отфильтрованного callback, без сортировки по DOM. */
export function toggleCheckboxGroupChildren<Value extends CheckboxGroupValue>(
  current: readonly Value[],
  value: Value,
  registered: readonly Value[]
): { value: Value[]; callbackValue: Value[]; } {
  const next = [...current];
  const index = next.indexOf(value);

  if (index === -1) next.push(value);
  else next.splice(index, 1);

  return { value: next, callbackValue: next.filter(item => registered.includes(item)) };
}

export function getCheckboxGroupValue<Value extends CheckboxGroupValue>(
  options: readonly CheckboxGroupOption<Value>[],
  value: readonly Value[]
): Value[] {
  const selected = new Set(value);

  return options.filter((option) => selected.has(option.value)).map((option) => option.value);
}
