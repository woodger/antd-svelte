import { describe, expect, it } from 'vitest';
import { findTreeMotionKey, getTreeMotionClassName, getTreeMotionConfig, getTreeMotionRange } from './tree-motion.engine';
import { buildTreeEntities, flattenTree } from './tree.engine';
import type { TreeMotionConfig } from './tree-motion.types';
import reference from '../../tests/browser/fixtures/ant-design-tree-motion-reference.json';
import { treeMotionData, treeMotionSamples } from '../../tests/browser/fixtures/tree-motion-cases';

describe('Tree motion range', () => {
  for (const sample of reference.cases) {
    const group = sample.steps.find(step => step.view.group)?.view.group;
    if (!group) continue;
    it(`preserves the Source transition range for ${sample.id}`, () => {
      const config = treeMotionSamples.find(s => s.id === sample.id)!;
      const index = buildTreeEntities(treeMotionData(config.children));
      const shorter = flattenTree(index, []);
      const longer = flattenTree(index, ['a']);

      expect(getTreeMotionRange(shorter, longer, 'a', config.virtual,
        config.height, config.compact ? 24 : (config.titleHeight ?? 24) + 4)
        .map(node => String(node.key))).toEqual(group.keys);
    });
  }

  it('finds exactly one added or removed key while preserving zero and bigint', () => {
    expect(findTreeMotionKey([], [0])).toEqual({ key: 0, show: true });
    expect(findTreeMotionKey([0, 2n], [0])).toEqual({ key: 2n, show: false });
    expect(findTreeMotionKey(['a'], ['b'])).toBeNull();
    expect(findTreeMotionKey([], ['a', 'b'])).toBeNull();
    expect(findTreeMotionKey(['a'], ['a'])).toBeNull();
    expect(findTreeMotionKey(['a'], ['b', 'c'])).toBeNull();
  });

  it('ends before the next visible sibling and keeps expanded descendants in the range', () => {
    const index = buildTreeEntities(treeMotionData());
    const result = getTreeMotionRange(flattenTree(index, []), flattenTree(index, ['a', 'a2']),
      'a', false, 28, 28);

    expect(result.map(node => node.key)).toEqual(['a1', 'a2', 'a21']);
    expect(result[0].node).toBe(index.entities.get('a1')!.node);
  });

  it('keeps all transition children without a viewport and limits virtual motion to a window', () => {
    const index = buildTreeEntities(treeMotionData(40));
    const shorter = flattenTree(index, []);
    const longer = flattenTree(index, ['a']);

    expect(getTreeMotionRange(shorter, longer, 'a', true, undefined, 28)).toHaveLength(40);
    expect(getTreeMotionRange(shorter, longer, 'a', true, 84, 28)).toHaveLength(4);
    expect(getTreeMotionRange(shorter, longer, 'a', false, 84, 28)).toHaveLength(40);
  });
});

describe('Tree collapse motion config', () => {
  it('keeps the custom object and treats false independently of null/undefined defaults', () => {
    const custom: TreeMotionConfig = Object.freeze({ motionName: 'own', motionAppear: true });

    expect(getTreeMotionConfig(custom, 'design')).toBe(custom);
    expect(getTreeMotionConfig(false, 'design')).toBe(false);
    expect(getTreeMotionConfig(null, 'design')).toMatchObject({
      motionName: 'design-motion-collapse', motionAppear: false, motionDeadline: 500
    });
    expect(getTreeMotionConfig(undefined, '')).toMatchObject({ motionName: '-motion-collapse' });
  });

  it('measures the whole group and finishes height events or the deadline while ignoring opacity', () => {
    const config = getTreeMotionConfig(undefined, 'ant') as TreeMotionConfig;
    const node = { scrollHeight: 84, offsetHeight: 42 } as HTMLDivElement;
    const height = Object.assign(new Event('transitionend'), { propertyName: 'height' });
    const opacity = Object.assign(new Event('transitionend'), { propertyName: 'opacity' });

    expect(config.onAppearStart?.(node, null)).toBe('height:0px;opacity:0');
    expect(config.onAppearActive?.(node, null)).toBe('height:84px;opacity:1');
    expect(config.onLeaveStart?.(node, null)).toBe('height:42px');
    expect(config.onLeaveActive?.(node, null)).toBe('height:0px;opacity:0');
    expect(config.onAppearEnd?.(node, height)).toBe(true);
    expect(config.onLeaveEnd?.(node, opacity)).toBe(false);
    expect(config.onAppearEnd?.(node, Object.assign(opacity, { deadline: false }))).toBe(false);
    expect(config.onEnterEnd?.(node, { deadline: true })).toBe(true);
  });

  it('uses the Source string/object phase class rules', () => {
    expect(getTreeMotionClassName('collapse', 'appear', 'start'))
      .toBe('collapse-appear collapse-appear-start collapse');
    expect(getTreeMotionClassName({ leave: 'close', leaveActive: 'closing' }, 'leave', 'active'))
      .toBe('close closing');
    expect(getTreeMotionClassName({ appear: 'open' }, 'appear', 'start')).toBe('open');
    expect(getTreeMotionClassName(undefined, 'leave', 'prepare')).toBeUndefined();
  });
});
