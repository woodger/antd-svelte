import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import {
  typographyActionNode,
  typographyCopyFallback,
  typographyCopyNodes,
  typographyDecorationTags,
  typographyEditKey,
  typographyEditValue,
  typographyHasChildren,
  typographyMeasureNeeded,
  typographyNodeLength,
  typographyNodes,
  typographySlice,
  typographyTextEllipsis,
  typographyTooltip
} from './typography.engine';

const atom = createRawSnippet(() => ({ render: () => '<b>whole node</b>' }));

describe('Typography text boundaries', () => {
  it('flattens nested arrays, retains zero and skips invisible boolean nodes', () => {
    expect(typographyNodes(['A', [0, null, [false, 'B']], true, undefined])).toEqual(['A', 0, 'B']);
    expect(typographyNodes(Object.freeze(['A', 'B']))).toEqual(['A', 'B']);
  });

  it('counts UTF-16 text and preserves snippets as whole nodes', () => {
    expect(typographyNodeLength(['😀', 12, atom, 100n])).toBe(6);
    expect(typographySlice(['Hello', atom, ' world'], 7)).toEqual(['Hello', atom, ' ']);
  });

  it('cuts numbers as text and keeps the source surrogate boundary', () => {
    expect(typographySlice([1234, 'tail'], 2)).toEqual(['12']);
    expect(typographySlice(['😀A'], 1)).toEqual(['\ud83d']);
    expect(typographySlice(['abc'], 0)).toEqual([]);
    expect(typographySlice(['abc'], 99)).toEqual(['abc']);
  });

  it.each([undefined, null, false, ''])('treats %s as copy icon-only content', value => {
    expect(typographyHasChildren(value)).toBe(false);
  });

  it.each([0, true, [], atom])('keeps the source presence check for nonempty values', value => {
    expect(typographyHasChildren(value)).toBe(true);
  });
});

describe('Typography copy content', () => {
  it('joins sibling scalar values without flattening nested array separators', () => {
    expect(typographyCopyFallback(['one', 'two', 0])).toBe('onetwo0');
    expect(typographyCopyFallback(['one', ['two', 'three'], false])).toBe('onetwo,threefalse');
    expect(typographyCopyFallback([null, undefined, 2n])).toBe('2');
  });

  it('retains the React element fallback for an opaque node', () => {
    expect(typographyCopyFallback(atom)).toBe('[object Object]');
    expect(typographyCopyFallback(['start', atom])).toBe('start[object Object]');
  });

  it('expands false copy configuration to both states without changing icon defaults', () => {
    expect(typographyCopyNodes(false)).toEqual([false, false]);
    expect(typographyCopyNodes('own')).toEqual(['own']);
    expect(typographyActionNode(false, 'default', true)).toBe('default');
    expect(typographyActionNode(false, 'default')).toBe(false);
    expect(typographyActionNode(true, 'default')).toBe('default');
    expect(typographyActionNode(undefined, 'default')).toBe('default');
    expect(typographyActionNode([], 'default', true)).toEqual([]);
  });
});

describe('Typography decorations and ellipsis mode', () => {
  it('keeps explicit null and undefined tooltip titles above the default content', () => {
    expect(typographyTooltip(true, 'content').title).toBe('content');
    expect(typographyTooltip({}, 'content').title).toBe('content');
    expect(typographyTooltip({ title: null }, 'content').title).toBeNull();
    expect(typographyTooltip({ title: undefined }, 'content').title).toBeUndefined();
    expect(typographyTooltip(['one', 'two'], 'content').title).toEqual(['one', 'two']);
  });
  it('wraps operations and content in the original outer-to-inner decoration order', () => {
    expect(typographyDecorationTags({ strong: true, underline: true, delete: true,
      code: true, mark: true, keyboard: true, italic: true }))
      .toEqual(['i', 'kbd', 'mark', 'code', 'del', 'u', 'strong']);
  });

  it('strips Text rows and expandable at the runtime boundary while retaining other config', () => {
    const source = { rows: 3, expandable: true, suffix: 'tail', expanded: true };

    expect(typographyTextEllipsis(source)).toEqual({ suffix: 'tail', expanded: true });
    expect(source.rows).toBe(3);
  });

  it.each([
    [{}, false, false, false],
    [{ rows: 3 }, false, false, false],
    [{ suffix: '' }, false, false, true],
    [{ expandable: true }, false, false, true],
    [{ tooltip: true }, false, false, false],
    [{}, true, false, true],
    [{}, false, true, true]
  ] as const)('chooses JS measurement for config %o, edit=%s, copy=%s', (config, edit, copy, js) => {
    expect(typographyMeasureNeeded(true, config, edit, copy)).toBe(js);
    expect(typographyMeasureNeeded(false, config, edit, copy)).toBe(false);
  });
});

describe('Typography editor input', () => {
  const enter = { keyCode: 13, ctrlKey: false, altKey: false, metaKey: false, shiftKey: false };

  it('removes CR/LF before storing the current edit text', () => {
    expect(typographyEditValue(' A\r\nB\nC\r ')).toBe(' ABC ');
  });

  it('accepts a matching plain Enter or Escape key pair', () => {
    expect(typographyEditKey(13, enter, false)).toBe('save');
    expect(typographyEditKey(27, { ...enter, keyCode: 27 }, false)).toBe('cancel');
  });

  it('ignores IME, mismatched key pairs and all modifiers', () => {
    expect(typographyEditKey(undefined, enter, false)).toBeUndefined();
    expect(typographyEditKey(229, enter, false)).toBeUndefined();
    expect(typographyEditKey(13, enter, true)).toBeUndefined();
    for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey'] as const) {
      expect(typographyEditKey(13, { ...enter, [modifier]: true }, false)).toBeUndefined();
    }
  });
});
