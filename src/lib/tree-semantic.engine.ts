import { mergeComponentSemantics } from './semantic-style.engine';
import type { TreeConfig, TreeProps, TreeSemanticName } from './tree.types';

/** Tree slots следуют provider/local порядку; native style остаётся на внешнем корне. */
export function treeSemantics<Data extends object>(
  context: TreeConfig | undefined,
  props: TreeProps<Data>
) {
  return mergeComponentSemantics<TreeSemanticName, TreeProps<Data>>(context, props,
    ['root', 'item', 'itemIcon', 'itemTitle', 'itemSwitcher']);
}
