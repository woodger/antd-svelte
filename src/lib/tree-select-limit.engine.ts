// Ant Design 6.6.8 / rc-tree-select 1.16.1; MIT, vendor/LICENSE.rc-tree-select.
import type { TreeSelectIndex } from './tree-select.engine';
import type { TreeSelectProps, TreeSelectRawValue } from './tree-select.types';

type LimitConfig = Pick<TreeSelectProps,
  'maxCount' | 'multiple' | 'treeCheckable' | 'treeCheckStrictly' | 'showCheckedStrategy'>;

/** Ограничения панели не меняют raw disabled/state данных и не участвуют в conduction. */
export function treeSelectLimit(
  config: LimitConfig,
  index: TreeSelectIndex<object>,
  checked: readonly TreeSelectRawValue[],
  displayCount: number
) {
  const strict = Boolean(config.treeCheckStrictly);
  const multiple = Boolean(config.multiple || config.treeCheckable || strict);
  const strategy = !config.treeCheckable ? 'SHOW_ALL' : config.showCheckedStrategy ?? 'SHOW_CHILD';
  // Ant wrapper фильтрует configured strategy до defaults rc-tree-select.
  const maxCount = !multiple || config.maxCount
    && (config.showCheckedStrategy === 'SHOW_PARENT'
      || config.showCheckedStrategy === 'SHOW_ALL' && !strict)
    ? undefined : config.maxCount;
  const changeMaxCount = strategy === 'SHOW_CHILD' || strict || !config.treeCheckable
    ? maxCount : undefined;
  const disabled = new Set<TreeSelectRawValue>();
  if (maxCount === undefined) return { changeMaxCount, disabled };

  const remaining = maxCount - displayCount;
  const selected = new Set(checked);
  const leafCountOnly = strategy === 'SHOW_CHILD' && !strict && Boolean(config.treeCheckable);
  for (const entry of index.ordered) {
    const value = entry.key as TreeSelectRawValue;
    if (selected.has(value)) continue;
    if (remaining <= 0 || leafCountOnly && remaining && entry.children.filter(child =>
      !child.node.disabled && !child.node.disableCheckbox
        && !selected.has(child.key as TreeSelectRawValue)
    ).length > remaining) disabled.add(value);
  }
  return { changeMaxCount, disabled };
}
