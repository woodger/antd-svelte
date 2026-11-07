import { describe, expect, it } from 'vitest';
import { buildFormErrorList, reconcileFormErrorList } from './form-error-list.engine';

describe('buildFormErrorList', () => {
  it('orders errors before warnings while preserving their text identity', () => {
    const messages = buildFormErrorList({ errors: ['First', 'Second'], warnings: ['Advice'] });

    expect(messages.map(({ content, status }) => ({ content, status }))).toEqual([
      { content: 'First', status: 'error' },
      { content: 'Second', status: 'error' },
      { content: 'Advice', status: 'warning' }
    ]);
    const reordered = buildFormErrorList({ errors: ['Second', 'First'] });
    expect(reordered.map(({ key }) => key)).toEqual([messages[1].key, messages[0].key]);
  });

  it.each([false, 0, ''])('uses non-null help %s instead of error and warning lists', (help) => {
    const messages = buildFormErrorList({
      help, helpStatus: 'success', errors: ['Ignored'], warnings: ['Ignored advice']
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ content: help, status: 'success' });
  });

  it.each([null, undefined])('falls through to messages when help is %s', (help) => {
    const messages = buildFormErrorList({ help, errors: ['Required'] });

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ content: 'Required', status: 'error' });
  });

  it('preserves renderable nodes and allocates distinct keys for duplicate and reserved text', () => {
    const messages = buildFormErrorList({
      errors: ['toString', 'toString', 'constructor', '__proto__', 'same', 'same', 'same-fallback-4', 0],
      warnings: ['toString', false]
    });

    expect(messages.map(({ content }) => content)).toEqual([
      'toString', 'toString', 'constructor', '__proto__', 'same', 'same', 'same-fallback-4', 0,
      'toString', false
    ]);
    expect(new Set(messages.map(({ key }) => key)).size).toBe(10);
    expect(messages[6].key).toBe('same-fallback-4');
  });
});

describe('reconcileFormErrorList', () => {
  it('retains removed messages in their source position until leave completes', () => {
    const previous = buildFormErrorList({ errors: ['First', 'Second'] })
      .map((entry) => ({ ...entry, visible: true }));

    const messages = reconcileFormErrorList(previous, buildFormErrorList({ errors: ['Second', 'Third'] }));

    expect(messages.map(({ content, visible }) => ({ content, visible }))).toEqual([
      { content: 'First', visible: false },
      { content: 'Second', visible: true },
      { content: 'Third', visible: true }
    ]);
  });

  it('moves existing messages without retaining a second copy of their key', () => {
    const previous = buildFormErrorList({ errors: ['toString', 'constructor'] })
      .map((entry) => ({ ...entry, visible: true }));

    const messages = reconcileFormErrorList(previous,
      buildFormErrorList({ errors: ['constructor', 'toString'] }));

    expect(messages.map(({ content, visible }) => ({ content, visible }))).toEqual([
      { content: 'constructor', visible: true }, { content: 'toString', visible: true }
    ]);
    expect(new Set(messages.map(({ key }) => key)).size).toBe(2);
  });
});
