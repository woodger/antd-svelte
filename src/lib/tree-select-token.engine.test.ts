import { describe, expect, it, vi } from 'vitest';
import { treeSelectPastedSearch, treeSelectTokenSearch,
  treeSelectTokenWithEnter } from './tree-select-token.engine';

describe('TreeSelect search tokenization', () => {
  it('clears search and closes after matching delimiters without selecting values', () => {
    expect(treeSelectTokenSearch('Alpha,Beta', { previousSearch: 'Alpha', separators: [','] }))
      .toEqual({ search: '', notifySearch: true, split: true, open: false });
    expect(treeSelectTokenSearch(',', { previousSearch: '', separators: [','] }))
      .toEqual({ search: '', notifySearch: false, split: true, open: false });
  });

  it('keeps unmatched text and does not request close for an ordinary empty input', () => {
    expect(treeSelectTokenSearch('Alpha', { previousSearch: 'Alpha', separators: [','] }))
      .toEqual({ search: 'Alpha', notifySearch: false, split: false, open: true });
    expect(treeSelectTokenSearch('', { previousSearch: 'Alpha', separators: [','] }))
      .toEqual({ search: '', notifySearch: true, split: false, open: undefined });
    expect(treeSelectTokenSearch('a,b', { previousSearch: '', separators: ['', ','] }).split).toBe(false);
  });

  it('distinguishes empty and unchanged function results from a token match', () => {
    for (const separators of [() => [], (value: string) => [value]]) {
      expect(treeSelectTokenSearch('a,b', { previousSearch: '', separators }).split).toBe(false);
    }
    expect(treeSelectTokenSearch('a,b', { previousSearch: '', separators: value => value.split(',') }).split).toBe(true);
  });

  it('defers splitting during composition while preserving search callbacks', () => {
    const separators = vi.fn((value: string) => value.split(','));
    expect(treeSelectTokenSearch('a,b', { previousSearch: '', separators, composing: true }))
      .toEqual({ search: 'a,b', notifySearch: true, split: false, open: true });
    expect(separators).not.toHaveBeenCalled();
    expect(treeSelectTokenSearch('a,b', { previousSearch: 'a,b', separators }).open).toBe(false);
    expect(separators).toHaveBeenCalledWith('a,b');
  });

  it('does not request open for effect-driven search updates', () => {
    expect(treeSelectTokenSearch('Alpha', { previousSearch: '', fromTyping: false }).open).toBeUndefined();
    const separators = vi.fn((text: string) => [text]);
    expect(treeSelectTokenSearch('', { previousSearch: '', separators, fromTyping: false }).notifySearch).toBe(false);
    expect(separators).toHaveBeenCalledWith('');
  });

  it('restores raw newlines only for tokenWithEnter and consumes the complete pasted substring', () => {
    expect(treeSelectTokenWithEnter(['\r'])).toBe(false);
    expect(treeSelectTokenWithEnter(['\n'])).toBe(true);
    expect(treeSelectTokenWithEnter(value => [value])).toBe(true);
    expect(treeSelectPastedSearch('left a b right', 'a\r\nb', ['\r\n'])).toBe('left a\r\nb right');
    expect(treeSelectPastedSearch('a b', 'a\nb', [','])).toBe('a b');
    expect(treeSelectPastedSearch('a', 'a\n', ['\n'])).toBe('a\n');
  });
});
