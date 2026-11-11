import { describe, expect, it } from 'vitest';
import { mergeTreeSelectComponentAttributes, treeSelectNativeKeyCancelled } from './tree-select-components.engine';

describe('TreeSelect component attribute composition', () => {
  it('keeps generated root props and original editor props in opposite precedence', () => {
    const generated = { id: 'generated', style: 'color:blue', disabled: true };
    const own = { id: 'own', class: 'own', style: 'color:red', disabled: false };

    expect(mergeTreeSelectComponentAttributes({}, generated, own, 'root'))
      .toEqual({ ...own, ...generated });
    expect(mergeTreeSelectComponentAttributes({}, generated, own, 'input'))
      .toEqual(own);
    expect(generated).toEqual({ id: 'generated', style: 'color:blue', disabled: true });
    expect(own.style).toBe('color:red');
  });

  it.each(['root', 'input'] as const)('runs both %s callbacks even after cancellation', slot => {
    const calls: string[] = [];
    const event = new Event('keydown', { cancelable: true });
    const generated = { onkeydown: (next: Event) => { calls.push('generated'); next.preventDefault(); } };
    const own = { onkeydown: (next: Event) => { calls.push('own'); next.preventDefault(); } };
    const attrs = mergeTreeSelectComponentAttributes({ onkeydown: generated.onkeydown }, generated, own, slot);

    attrs.onkeydown(event);

    expect(calls).toEqual(slot === 'root' ? ['generated', 'own'] : ['own', 'generated']);
    expect(event.defaultPrevented).toBe(true);
  });

  it('allows explicit undefined to replace generated editor values', () => {
    const attrs = mergeTreeSelectComponentAttributes({ value: 'query' as string | undefined },
      { value: 'query' }, { value: undefined }, 'input');

    expect(Object.hasOwn(attrs, 'value')).toBe(true);
    expect(attrs.value).toBeUndefined();
  });

  it('does not deliver blur callbacks to an editor removed during snippet teardown', () => {
    const calls: string[] = [];
    const generated = { onblur: (_event: unknown) => { calls.push('generated'); } };
    const own = { onblur: (_event: unknown) => { calls.push('own'); } };
    const attrs = mergeTreeSelectComponentAttributes({ onblur: generated.onblur }, generated, own, 'root');

    attrs.onblur({ currentTarget: { isConnected: false } });
    expect(calls).toEqual([]);
    attrs.onblur({ currentTarget: { isConnected: true } });
    expect(calls).toEqual(['generated', 'own']);
  });

  it('preserves callbacks without a corresponding generated handler', () => {
    let value = '';
    const attrs = mergeTreeSelectComponentAttributes({ oninput: (text: string) => { value = text; } },
      {}, undefined, 'input');

    attrs.oninput('draft');
    expect(value).toBe('draft');
  });
});

describe('TreeSelect native key cancellation', () => {
  it('distinguishes an earlier slot cancellation from a repeated native request', () => {
    const event = new Event('keydown', { cancelable: true });
    event.preventDefault();
    const original = event.preventDefault;

    expect(treeSelectNativeKeyCancelled(event, next => { expect(next).toBe(event); })).toBe(false);
    expect(treeSelectNativeKeyCancelled(event, next => { next.preventDefault(); })).toBe(true);
    expect(event.preventDefault).toBe(original);
    expect(Object.hasOwn(event, 'preventDefault')).toBe(false);
  });

  it('restores the original method when the native handler throws', () => {
    const event = new Event('keydown', { cancelable: true });
    event.preventDefault();
    const original = event.preventDefault;

    expect(() => treeSelectNativeKeyCancelled(event, () => { throw new Error('handler'); })).toThrow('handler');
    expect(event.preventDefault).toBe(original);
  });
});
