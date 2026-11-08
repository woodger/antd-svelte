import type { SelectOption } from './types';
import type { SelectOmittedTag } from './select.types';

/** Source numeric slice сохраняет порядок. NaN не должен скрывать весь выбранный список. */
export function getSelectTagOverflow<Value extends string | number>(
  tags: readonly SelectOption<Value>[], maxCount?: number
) {
  const visible = typeof maxCount === 'number' && !Number.isNaN(maxCount)
    ? tags.slice(0, maxCount) : tags;
  const omitted: SelectOmittedTag<Value>[] = tags.slice(visible.length).map(option => ({
    value: option.value, label: option.label, disabled: option.disabled, key: option.value
  }));
  return { visible, omitted };
}
