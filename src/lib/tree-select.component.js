import TreeSelect from './TreeSelect.svelte';
import TreeNode from './TreeSelectTreeNode.svelte';
import { TREE_SELECT_SHOW_ALL, TREE_SELECT_SHOW_CHILD, TREE_SELECT_SHOW_PARENT } from './tree-select.engine';

const api = /** @type {const} */ ({
  TreeNode,
  SHOW_ALL: TREE_SELECT_SHOW_ALL,
  SHOW_CHILD: TREE_SELECT_SHOW_CHILD,
  SHOW_PARENT: TREE_SELECT_SHOW_PARENT
});

/** @type {typeof TreeSelect & typeof api} */
const component = Object.assign(TreeSelect, api);

export default component;
