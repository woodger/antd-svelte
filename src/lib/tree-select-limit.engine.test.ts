import { describe, expect, it } from 'vitest';
import { treeSelectLimit } from './tree-select-limit.engine';
import { treeSelectData } from './tree-select-data.engine';
import { treeSelectChecks, treeSelectIndex, treeSelectLabeled, treeSelectStrategy } from './tree-select.engine';
import type { TreeSelectRawValue } from './tree-select.types';
import type { TreeSelectMaxCountSample } from '../../tests/browser/fixtures/tree-select-max-count-cases';
import reference from '../../tests/browser/fixtures/ant-design-tree-select-max-count-reference.json';

function limits(sample: TreeSelectMaxCountSample, data = sample.data) {
  const index = treeSelectIndex(treeSelectData(data, sample.simple), sample.aliases
    ? { value: 'code', label: 'caption', children: 'nodes' } : undefined);
  const config = { maxCount: sample.maxCount, multiple: sample.multiple ?? true,
    treeCheckable: sample.checkable, treeCheckStrictly: sample.strict,
    showCheckedStrategy: sample.strategy };
  const checks = treeSelectChecks(treeSelectLabeled(sample.value), Boolean(sample.checkable && !sample.strict), index);
  const strategy = !sample.checkable ? 'SHOW_ALL' : sample.strategy ?? 'SHOW_CHILD';
  return { index, ...treeSelectLimit(config, index, checks.checked,
    treeSelectStrategy(checks.checked, strategy, index).length) };
}

function rows(sample: TreeSelectMaxCountSample, data = sample.data) {
  const { index, disabled } = limits(sample, data);
  return index.ordered.map(entry => ({ value: String(entry.key),
    disabled: Boolean(entry.node.disabled) || disabled.has(entry.key as TreeSelectRawValue) }));
}

describe('TreeSelect selection limits', () => {
  for (const entry of reference.cases) {
    it(`preserves Source initial row restrictions for ${entry.sample.id}`, () => {
      const sample = entry.sample as TreeSelectMaxCountSample;

      expect(rows(sample)).toEqual(entry.steps[0].view.nodes.map(node => ({
        value: node.value, disabled: node.disabled
      })));
    });
  }

  it('preserves frozen original disabled fields, selected arrays and payload references', () => {
    const payload = Object.freeze({ version: 1 });
    const data = Object.freeze([
      Object.freeze({ value: 0, payload }), Object.freeze({ value: 1 }),
      Object.freeze({ value: 2, disabled: true })
    ]);
    const checked = Object.freeze([1]);
    const index = treeSelectIndex(data);
    const limit = treeSelectLimit({ maxCount: 1, multiple: true }, index, checked, 1);

    expect([...limit.disabled]).toEqual([0, 2]);
    expect(index.values.get(0)).toBe(data[0]);
    expect(Reflect.get(index.values.get(0)!, 'payload')).toBe(payload);
    expect(Object.hasOwn(data[0], 'disabled')).toBe(false);
    expect(Reflect.get(data[2], 'disabled')).toBe(true);
    expect(checked).toEqual([1]);
  });

  it('keeps single selection unrestricted like the public Source counterpart', () => {
    const source = reference.observations.find(entry => entry.sample.id === 'single')!;
    const counterpart = reference.cases.find(entry => entry.sample.id === 'single-unlimited')!;

    expect(source.steps[0].view.nodes.find(node => node.value === '2')!.disabled).toBe(true);
    expect(rows(source.sample as TreeSelectMaxCountSample))
      .toEqual(counterpart.steps[0].view.nodes.map(node => ({ value: node.value, disabled: node.disabled })));
  });

  it('recalculates child restrictions for new data even when the remaining count stays the same', () => {
    const source = reference.observations.find(entry => entry.sample.id === 'grow')!;
    const sample = source.sample as TreeSelectMaxCountSample;
    const counterpart = reference.cases.find(entry => entry.sample.id === 'fresh-wide')!;

    expect(limits(sample).disabled.has(0)).toBe(false);
    expect(source.steps[1].view.nodes.find(node => node.value === '0')!.disabled).toBe(false);
    expect(rows(sample, sample.nextData))
      .toEqual(counterpart.steps[0].view.nodes.map(node => ({ value: node.value, disabled: node.disabled })));
  });
});
