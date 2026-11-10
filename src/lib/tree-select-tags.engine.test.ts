import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { treeSelectTagText, treeSelectTagOverflow } from './tree-select-tags.engine';
import type { TreeSelectLabel, TreeSelectLabeledValue } from './tree-select.types';
import reference from '../../tests/browser/fixtures/ant-design-tree-select-tags-reference.json';

describe('TreeSelect tag content', () => {
  for (const id of ['text-three', 'text-zero', 'text-negative', 'text-fraction', 'text-nan',
    'text-infinity', 'number', 'numeric-zero']) {
    it(`preserves the independent Source scalar text for ${id}`, () => {
      const entry = reference.cases.find(entry => entry.sample.id === id)!;
      const label = id === 'number' ? 123456 : id === 'numeric-zero' ? 0 : 'Alphabet';
      const length = entry.sample.length === 'nan' ? Number.NaN
        : entry.sample.length === 'infinity' ? Number.POSITIVE_INFINITY
          : typeof entry.sample.length === 'number' ? entry.sample.length : undefined;

      expect(String(treeSelectTagText(label, length))).toBe(entry.initial.view.tags[0].text);
      expect(entry.initial.view.tags[0].title).toBe(String(label));
    });
  }

  it('preserves opaque labels and scalar identity when truncation is not required', () => {
    const snippet = createRawSnippet(() => ({ render: () => '<em>Label</em>' }));
    const labels: readonly TreeSelectLabel[] = [true, false, null, undefined, ['Long', 0], snippet];

    for (const label of labels) expect(treeSelectTagText(label, 1)).toBe(label);
    expect(treeSelectTagText(123, 4)).toBe(123);
    expect(treeSelectTagText(0)).toBe(0);
    expect(treeSelectTagText('Original')).toBe('Original');
  });

  it('keeps Unicode pairs complete like the established Native Select adapter', () => {
    expect(treeSelectTagText('😀word', 1)).toBe('...');
    expect(treeSelectTagText('A😀word', 2)).toBe('A...');
    expect(treeSelectTagText('😀word', 2)).toBe('😀...');
  });
});

describe('TreeSelect omitted tag records', () => {
  const tags = Object.freeze([
    Object.freeze({ value: 0, label: 'Alphabet' }),
    Object.freeze({ value: 1, label: 'Beta', halfChecked: false }),
    Object.freeze({ value: 'locked', label: 'Locked', disabled: true }),
    Object.freeze({ value: 'tail', label: 'Tail' })
  ] satisfies TreeSelectLabeledValue[]);

  it.each(['count-zero', 'count-one', 'count-two', 'count-negative', 'count-fraction', 'count-infinity'])(
    'preserves Source visible values for %s', id => {
    const entry = reference.cases.find(entry => entry.sample.id === id)!;
    const count = entry.sample.count === 'infinity' ? Number.POSITIVE_INFINITY
      : typeof entry.sample.count === 'number' ? entry.sample.count : undefined;
    const split = treeSelectTagOverflow(tags, count);
    const visible = entry.initial.view.tags.filter(tag => tag.removable || tag.disabled)
      .map(tag => tags.find(item => item.label === tag.title)!.value);

    expect(split.visible.map(item => item.value)).toEqual(visible);
    expect([...split.visible, ...split.omitted]).toEqual(tags);
    for (const item of split.omitted) {
      expect(tags).toContain(item);
      expect(Object.hasOwn(item, 'key')).toBe(false);
    }
  });

  it('keeps every selected item for an undefined or NaN visible count', () => {
    expect(treeSelectTagOverflow(tags).visible).toBe(tags);
    expect(treeSelectTagOverflow(tags, Number.NaN)).toEqual({ visible: tags, omitted: [] });
  });

  it('retains original rich label references and half/disabled fields in omitted records', () => {
    const label = Object.freeze(['Original', 0]);
    const original = Object.freeze({ value: 0, label, halfChecked: false, disabled: true });
    const split = treeSelectTagOverflow(Object.freeze([original]), 0);

    expect(split.omitted[0]).toBe(original);
    expect(split.omitted[0].label).toBe(label);
    expect(split.omitted[0]).toEqual(original);
  });
});
