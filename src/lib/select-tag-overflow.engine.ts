import type { SelectOption } from './types';
import type { SelectOmittedTag } from './select.types';

/** Rest не занимает место, когда все tags уже помещаются. */
export function getResponsiveTagCount(widths: readonly number[], available: number, rest: number) {
  if (widths.reduce((sum, width) => sum + width, 0) <= available) return widths.length;

  let used = 0;
  for (let index = 0; index < widths.length; index++) {
    used += widths[index];
    if (used + rest > available) return index;
  }
  return widths.length;
}

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
