import { describe, expect, it } from 'vitest';
import { resolveFormTooltip } from './form-tooltip.engine';

describe('resolveFormTooltip', () => {
  it.each([undefined, null, false, ''])('keeps tooltip disabled for %s despite context defaults', (value) => {
    expect(resolveFormTooltip(value, { title: 'Context' })).toBeUndefined();
  });

  it.each([0, true, 'Details'])('keeps renderable scalar %s as title', (value) => {
    expect(resolveFormTooltip(value, { title: 'Context', placement: 'right' }))
      .toEqual({ title: value, placement: 'right' });
  });

  it('renders nested readonly arrays instead of spreading them into options', () => {
    const content = ['Details ', [0, false]] as const;
    const result = resolveFormTooltip(content, { placement: 'right' });

    expect(result).toEqual({ title: content, placement: 'right' });
    expect(result?.title).toBe(content);
    expect(content).toEqual(['Details ', [0, false]]);
  });

  it('enables inherited title through empty options and replaces only explicit local keys', () => {
    const context = { title: 'Context', placement: 'right' as const, open: true };

    expect(resolveFormTooltip({}, context)).toEqual(context);
    expect(resolveFormTooltip({ title: undefined, icon: null, open: false }, context))
      .toEqual({ title: undefined, icon: null, open: false, placement: 'right' });
    expect(context).toEqual({ title: 'Context', placement: 'right', open: true });
  });
});
