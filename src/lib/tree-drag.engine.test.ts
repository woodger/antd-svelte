import { describe, expect, it } from 'vitest';
import { buildTreeEntities, flattenTree } from './tree.engine';
import { getTreeDragChildren, resolveTreeDrop, treeDropIndicatorStyle } from './tree-drag.engine';
import reference from '../../tests/browser/fixtures/ant-design-tree-drag-reference.json';
import { treeDragData } from '../../tests/browser/fixtures/tree-drag-cases';

describe('Tree drop geometry reference', () => {
  for (const entry of reference.cases) {
    for (const [stepIndex, step] of entry.steps.entries()) {
      if (!('geometry' in step) || !step.geometry) continue;
      const geometry = step.geometry;

      it(`matches rc-tree for ${entry.sample.id}/${stepIndex}`, () => {
        const index = buildTreeEntities(treeDragData(entry.sample.virtual));
        const source = index.entities.get(String(geometry.dragKey))!;
        const allow = 'allow' in entry.sample ? entry.sample.allow : undefined;
        const result = resolveTreeDrop({
          index,
          visible: flattenTree(index, geometry.expandedKeys),
          expandedKeys: geometry.expandedKeys,
          dragNode: source.node,
          targetKey: geometry.targetKey,
          clientX: geometry.clientX,
          clientY: geometry.clientY,
          rect: geometry.rect,
          startX: geometry.startX,
          indent: geometry.indent,
          rtl: 'direction' in entry.sample && entry.sample.direction === 'rtl',
          allowDrop: ({ dropPosition }) => allow === 'gap' ? dropPosition !== 0
            : allow === 'inside' ? dropPosition === 0
              : allow === 'before' ? dropPosition === -1 : allow !== 'never'
        });

        expect(result).toEqual(geometry.result);
      });
    }
  }
});

describe('Tree drag data boundaries', () => {
  it('collects collapsed descendants with their original numeric and bigint keys', () => {
    const index = buildTreeEntities([{ key: 0, children: [
      { key: 1n, children: [{ key: 'leaf' }] }, { key: 2 }
    ] }]);

    expect(getTreeDragChildren(index.roots[0])).toEqual([1n, 'leaf', 2]);
  });

  it('preserves a zero container key instead of the Source null fallback', () => {
    const index = buildTreeEntities(treeDragData());
    const result = resolveTreeDrop({
      index, visible: flattenTree(index, [0]), expandedKeys: [0],
      dragNode: index.entities.get('c')!.node, targetKey: 'z1',
      startX: 100, clientX: 100, clientY: 20, rect: { top: 0, height: 24 },
      indent: 24, rtl: false
    });

    expect(result).toMatchObject({ dropTargetKey: 'z1', dropPosition: 1, dropContainerKey: 0 });
  });

  it('passes original generic records to allowDrop and keeps canonical key positions', () => {
    const records = [{ uid: 0, label: 'Source' }, { uid: 2n, label: 'Target' }];
    const index = buildTreeEntities(records, { key: 'uid' });
    const calls: unknown[] = [];
    const result = resolveTreeDrop({
      index, visible: flattenTree(index, []), expandedKeys: [], dragNode: records[0],
      targetKey: 2n, startX: 100, clientX: 160, clientY: 20, rect: { top: 0, height: 24 },
      indent: 24, rtl: false,
      allowDrop: info => {
        calls.push(info);
        expect(info.dragNode).toBe(records[0]);
        expect(info.dropNode).toBe(records[1]);
        return true;
      }
    });

    expect(calls).toHaveLength(1);
    expect(result).toMatchObject({ dropTargetKey: 2n, dropTargetPos: '0-1', dropPosition: 0 });
  });

  it('ignores missing targets and empty visible data', () => {
    const index = buildTreeEntities([{ key: 'a' }]);
    const options = {
      index, visible: index.roots, expandedKeys: [], dragNode: index.roots[0].node,
      targetKey: 'missing', startX: 0, clientX: 0, clientY: 0,
      rect: { top: 0, height: 24 }, indent: 24, rtl: false
    };

    expect(resolveTreeDrop(options)).toBeNull();
    expect(resolveTreeDrop({ ...options, targetKey: 'a', visible: [] })).toBeNull();
  });

  it('mirrors indicator insets and top/bottom positions without changing the key namespace', () => {
    const state = { dropPosition: 1 as const, dropLevelOffset: 2, dropTargetKey: 'a',
      dropTargetPos: '0-0', dragOverNodeKey: 'leaf', dropContainerKey: null, dropAllowed: true };

    expect(treeDropIndicatorStyle(state, 24, false)).toBe('left:-44px;right:0;bottom:-3px');
    expect(treeDropIndicatorStyle(state, 24, true)).toBe('right:-44px;left:0;bottom:-3px');
    expect(treeDropIndicatorStyle({ ...state, dropPosition: -1 }, 24, false))
      .toBe('left:-44px;right:0;top:-3px');
    expect(treeDropIndicatorStyle({ ...state, dropPosition: 0 }, 36, true))
      .toBe('right:40px;left:0;bottom:-3px');
  });
});
