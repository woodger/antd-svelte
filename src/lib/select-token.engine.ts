import type { SelectOption } from './types';
import type { SelectTokenSeparators } from './select.types';

/** @rc-component/select 1.10.1; MIT, см. vendor/LICENSE.rc-select. */
export function splitSelectTokens(
  text: string, separators?: SelectTokenSeparators, end?: number
) {
  if (typeof separators === 'function') {
    const words = separators(text);
    return Array.isArray(words) && words.length && !(words.length === 1 && words[0] === text)
      ? words.slice(0, end) : null;
  }
  if (!separators?.length) return null;
  const tokens = separators;
  let matched = false;

  function split(value: string, index: number): string[] {
    const token = tokens[index];
    if (!token) return [value];
    const parts = value.split(token);
    if (parts.length > 1) matched = true;
    return parts.flatMap(part => split(part, index + 1)).filter(Boolean);
  }

  const words = split(text, 0);
  return matched ? words.slice(0, end) : null;
}

/** Multiple разрешает label/явные search fields, tags создаёт строки; disabled не добавляются. */
export function resolveSelectTokenOptions<Value extends string | number>(
  options: readonly SelectOption<Value>[],
  words: readonly string[],
  tags: boolean,
  optionFilterProp?: string | readonly string[]
): SelectOption<Value | string>[] {
  const values = new Map<Value | string, SelectOption<Value | string>>(
    options.map(option => [option.value, option])
  );
  const labels = new Map<unknown, SelectOption<Value>>();
  const fields = typeof optionFilterProp === 'string' ? [optionFilterProp] : optionFilterProp ?? [];
  if (!tags) {
    for (const option of options) {
      for (const field of ['label', ...fields]) {
        if (field && Object.hasOwn(option, field)) labels.set(Reflect.get(option, field), option);
      }
    }
  }

  return words.flatMap(word => {
    const option = tags ? values.get(word) : labels.get(word);
    if (option?.disabled) return [];
    if (option) return [option];
    return tags && word.trim() ? [{ value: word, label: word }] : [];
  });
}
