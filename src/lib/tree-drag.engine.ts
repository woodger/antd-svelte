// @rc-component/tree 1.4.0; MIT, vendor/LICENSE.rc-tree.
import type { TreeEntity, TreeIndex } from './tree.engine';
import type { TreeAllowDrop, TreeDropPosition, TreeKey } from './tree.types';

export interface TreeDropState {
  dropPosition: TreeDropPosition;
  dropLevelOffset: number;
  dropTargetKey: TreeKey;
  dropTargetPos: string;
  dragOverNodeKey: TreeKey;
  dropContainerKey: TreeKey | null;
  dropAllowed: boolean;
}

export interface TreeDropOptions<Data extends object> {
  index: TreeIndex<Data>;
  visible: readonly TreeEntity<Data>[];
  expandedKeys: readonly TreeKey[];
  dragNode: Data;
  targetKey: TreeKey;
  clientX: number;
  clientY: number;
  rect: { top: number; height: number; };
  startX: number;
  indent: number;
  rtl: boolean;
  allowDrop?: TreeAllowDrop<Data>;
}

export function getTreeDragChildren<Data extends object>(entry: TreeEntity<Data>): TreeKey[] {
  return entry.children.flatMap(child => [child.key, ...getTreeDragChildren(child)]);
}

/** Геометрия Source использует event.target и весь flatten, а не только mounted window. */
export function resolveTreeDrop<Data extends object>(options: TreeDropOptions<Data>): TreeDropState | null {
  const { index, visible, dragNode, targetKey, clientX, clientY, rect, startX, indent, rtl } = options;
  let target = index.entities.get(String(targetKey));
  if (!target || !visible.length) return null;

  const rawLevelOffset = ((rtl ? -1 : 1) * (startX - clientX) - 12) / indent;
  const expanded = new Set(options.expandedKeys.filter(
    key => index.entities.get(String(key))?.children.length
  ));
  const firstHalf = clientY < rect.top + rect.height / 2;
  if (firstHalf) {
    const position = visible.findIndex(entry => entry.key === targetKey);
    target = visible[Math.max(0, position - 1)];
  }
  const over = target;
  let levelOffset = 0;
  if (!expanded.has(target.key)) {
    for (let offset = 0; offset < rawLevelOffset; offset += 1) {
      if (!target.parent || target.index !== target.parent.children.length - 1) break;
      target = target.parent;
      levelOffset += 1;
    }
  }
  const allow = (dropPosition: TreeDropPosition) => options.allowDrop
    ? options.allowDrop({ dragNode, dropNode: target.node, dropPosition }) : true;
  let position: TreeDropPosition = 0;
  let allowed = true;
  if (target.index === 0 && target.level === 0 && firstHalf && allow(-1)
    && target.key === targetKey) {
    position = -1;
  } else if (over.children.length && expanded.has(over.key)) {
    allowed = allow(0);
  } else if (levelOffset === 0 && !(rawLevelOffset > -1.5)) {
    if (allow(0)) position = 0;
    else if (allow(1)) position = 1;
    else allowed = false;
  } else {
    if (allow(1)) position = 1;
    else allowed = false;
  }

  return {
    dropPosition: position,
    dropLevelOffset: levelOffset,
    dropTargetKey: target.key,
    dropTargetPos: target.pos,
    dragOverNodeKey: over.key,
    // Source теряет key=0 через || null; Native сохраняет canonical key.
    dropContainerKey: position === 0 ? null : target.parent?.key ?? null,
    dropAllowed: allowed
  };
}

export function treeDropIndicatorStyle(state: TreeDropState, indent: number, rtl: boolean) {
  const start = rtl ? 'right' : 'left';
  const end = rtl ? 'left' : 'right';
  const inset = state.dropPosition === 0 ? indent + 4 : -state.dropLevelOffset * indent + 4;
  return `${start}:${inset}px;${end}:0;${state.dropPosition === -1 ? 'top' : 'bottom'}:-3px`;
}
