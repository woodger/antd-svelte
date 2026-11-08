import type { SelectOption } from './types';
import { selectOptionMatchesFields } from './select.engine';

/** @rc-component/select 1.10.1 tag options; MIT, см. vendor/LICENSE.rc-select. */
export function getSelectTagOptions<Value extends string | number>(
  options: readonly SelectOption<Value>[],
  selected: ReadonlyMap<Value | string, SelectOption<Value | string>>,
  search: string,
  filter: boolean | ((search: string, option: SelectOption<Value | string>) => boolean) = true,
  optionFilterProp?: string | readonly string[]
): readonly SelectOption<Value | string>[] {
  const known = new Map<Value | string, SelectOption<Value | string>>(
    options.map(option => [option.value, option])
  );
  const filled: SelectOption<Value | string>[] = [...options];
  for (const option of [...selected.values()].sort((a, b) => a.value < b.value ? -1 : 1)) {
    if (!known.has(option.value)) filled.push(option);
  }
  const fields = typeof optionFilterProp === 'string' ? [optionFilterProp] : optionFilterProp ?? [];
  const filtered = !search || filter === false ? filled : filled.filter(option =>
    typeof filter === 'function' ? filter(search, option)
      : selectOptionMatchesFields(option, search, fields.length ? fields : ['value']));
  const exact = filtered.some(option => option.value === search || fields.some(field =>
    Object.hasOwn(option, field) && Reflect.get(option, field) === search));

  // Не создаём Source whitespace-only tag; явный option с таким value остаётся доступным.
  return search.trim() && !exact && !known.get(search)?.disabled
    ? [{ value: search, label: search }, ...filtered] : filtered;
}
