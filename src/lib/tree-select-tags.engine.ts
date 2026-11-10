import { getSelectTagText } from './select-tag-text.engine';
import type { TreeSelectLabel, TreeSelectLabeledValue } from './tree-select.types';

/** Как rc-select MultipleContent: rich labels остаются opaque, tooltip хранит полный label. */
export function treeSelectTagText(label: TreeSelectLabel, maxLength?: number): TreeSelectLabel {
  return typeof maxLength === 'number' && (typeof label === 'string' || typeof label === 'number')
    && String(label).length > maxLength ? getSelectTagText(String(label), maxLength) : label;
}

/** Omitted records TreeSelect не получают synthetic key и сохраняют исходные labels/state. */
export function treeSelectTagOverflow(tags: readonly TreeSelectLabeledValue[], count?: number) {
  const visible = typeof count === 'number' && !Number.isNaN(count) ? tags.slice(0, count) : tags;
  return { visible, omitted: tags.slice(visible.length) };
}
