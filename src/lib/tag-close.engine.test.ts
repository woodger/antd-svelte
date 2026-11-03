import { describe, expect, it } from 'vitest';
import { getTagClose } from './tag-close.engine';

describe('Tag closable resolution', () => {
  it('hides the default control and inherits explicit context configuration', () => {
    expect(getTagClose({}).visible).toBe(false);
    expect(getTagClose({}, { closable: true }))
      .toEqual({ visible: true, icon: undefined, attributes: {} });
    expect(getTagClose({}, { closeIcon: 'X' }).icon).toBe('X');
  });

  it('gives local false priority while explicit closable ignores a false prop icon', () => {
    expect(getTagClose({ closable: false }, { closeIcon: 'X' }).visible).toBe(false);
    expect(getTagClose({ closeIcon: false }, { closable: true }).visible).toBe(false);
    expect(getTagClose({ closable: true, closeIcon: false }).visible).toBe(true);
    expect(getTagClose({ closable: true, closeIcon: null }).visible).toBe(true);
  });

  it('keeps context icons when a local configuration leaves them undefined', () => {
    expect(getTagClose({ closable: true }, { closeIcon: 'X' }).icon).toBe('X');
    expect(getTagClose({ closable: { closeIcon: undefined } }, { closeIcon: 'X' }).icon)
      .toBe('X');
    expect(getTagClose({ closeIcon: true }, { closable: false }).visible).toBe(true);
  });

  it('preserves scalar and blank object icons while object null removes the control', () => {
    expect(getTagClose({ closeIcon: 0 })).toMatchObject({ visible: true, icon: 0 });
    expect(getTagClose({ closeIcon: '' })).toMatchObject({ visible: true, icon: '' });
    expect(getTagClose({ closable: { closeIcon: false } }))
      .toMatchObject({ visible: true, icon: false });
    expect(getTagClose({ closable: { closeIcon: true } }))
      .toMatchObject({ visible: true, icon: true });
    expect(getTagClose({ closable: { closeIcon: null } }).visible).toBe(false);
  });

  it('merges defined ARIA properties and leaves Tag disabled semantics to the component', () => {
    const close = getTagClose({ closable: { disabled: true, 'aria-label': 'Local' } }, {
      closable: { 'aria-label': 'Context', 'aria-describedby': 'context-description' }
    });

    expect(close).toEqual({
      visible: true,
      icon: undefined,
      attributes: { 'aria-label': 'Local', 'aria-describedby': 'context-description' }
    });
  });
});
