import { untrack } from 'svelte';
import { findTreeMotionKey, getTreeMotionRange } from './tree-motion.engine';
import type { TreeEntity } from './tree.engine';
import type { TreeKey } from './tree.types';
import type { TreeMotionConfig } from './tree-motion.types';

export interface TreeMotionGroup<Data extends object> {
  key: symbol;
  motionNodes: readonly TreeEntity<Data>[];
  show: boolean;
  id: number;
}
export type TreeMotionRow<Data extends object> = TreeEntity<Data> | TreeMotionGroup<Data>;

/** NodeList сохраняет соседние keyed строки и временно заменяет диапазон одной motion group. */
export function createTreeMotion<Data extends object>(options: {
  rows: () => readonly TreeEntity<Data>[];
  expanded: () => readonly TreeKey[];
  motion: () => TreeMotionConfig | false;
  virtual: () => boolean | undefined;
  height: () => number | undefined;
  itemHeight: () => number;
  dragging: () => boolean;
}) {
  const key = Symbol('tree motion');
  let previous = untrack(() => ({ rows: options.rows(), expanded: options.expanded(), dragging: false }));
  let rows = $state.raw<readonly TreeMotionRow<Data>[]>(previous.rows);
  let group = $state.raw<TreeMotionGroup<Data> | null>(null);
  let revision = 0;
  let disposed = false;

  function finish(id?: number) {
    if (disposed || id !== undefined && group?.id !== id) return;
    group = null;
    rows = options.rows();
  }

  $effect.pre(() => {
    const next = { rows: options.rows(), expanded: options.expanded(), dragging: options.dragging() };
    const motion = options.motion();
    const virtual = options.virtual();
    const height = options.height();
    const estimate = options.itemHeight();
    untrack(() => {
      const changed = findTreeMotionKey(previous.expanded, next.expanded);
      if (!motion || previous.dragging && !next.dragging) finish();
      else if (changed) {
        const shorter = changed.show ? previous.rows : next.rows;
        const longer = changed.show ? next.rows : previous.rows;
        const position = shorter.findIndex(entry => entry.key === changed.key);
        const nodes = getTreeMotionRange(shorter, longer, changed.key, virtual, height, estimate);
        // Скрытый expanded key не должен подменять диапазон другого корня.
        if (position < 0 || !nodes.length) finish();
        else {
          group = { key, motionNodes: nodes, show: changed.show, id: ++revision };
          rows = [...shorter.slice(0, position + 1), group, ...shorter.slice(position + 1)];
        }
      } else if (next.rows !== previous.rows) finish();
      previous = next;
    });
  });

  return {
    get rows() { return rows; },
    get group() { return group; },
    finish,
    dispose() { disposed = true; }
  };
}
