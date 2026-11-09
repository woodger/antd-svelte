import { describe, expect, it } from 'vitest';
import { getPickerPrefixCss } from './picker-prefix.engine';

describe('Date/Time picker prefix stylesheet', () => {
  it('keeps canonical styling without an extra sheet', () => {
    expect(getPickerPrefixCss('ant-picker', 'ant')).toBeUndefined();
  });

  it('separates local owners and private affix variables from canonical tokens', () => {
    const css = getPickerPrefixCss('dates', 'suite')!;

    expect(css).toContain('.dates-dropdown:where([data-ant-picker-prefix="dates"][data-ant-picker-root-prefix="suite"])');
    expect(css).toContain('.ant-picker-css-var:where(');
    expect(css).toContain('.dates-time-panel-cell-selected');
    expect(css).toContain('[class^="dates"]');
    expect(css).toContain('--suite-date-picker-affix-color');
    expect(css).toContain('.suite-tag-blue');
    expect(css).toContain('--ant-date-picker-active-bg');
    expect(css).not.toContain('--ant-date-picker-affix-color');
    expect(css).not.toContain('.ant-picker-time-panel');
    expect(css).toMatch(/:where\(\.ant-picker-css-var[^\n]+\)\{--ant-date-picker-line-width-focus:/);
  });

  it('keeps literal prefix text and escapes closing style tags', () => {
    expect(getPickerPrefixCss('dates-$&', 'suite')).toContain('.dates-$&-input');
    expect(getPickerPrefixCss('dates-</style><script>', 'suite')).not.toContain('</style');
  });
});
