import { describe, expect, it } from 'vitest';
import { getSelectPrefixCss } from './select-prefix.engine';

describe('Select prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getSelectPrefixCss('ant-select', 'ant')).toBeUndefined();
  });

  it('isolates owner/control/popup scopes and keeps canonical tokens with independent variables', () => {
    const css = getSelectPrefixCss('choices', 'suite')!;

    expect(css).toContain('.choices:where([data-ant-select-prefix="choices"][data-ant-select-root-prefix="suite"])');
    expect(css).toContain('.choices-dropdown:where(');
    expect(css).toContain('[class^="choices"]');
    expect(css).toContain('[class*=" choices"]');
    expect(css).toContain('--suite-select-height');
    expect(css).toContain('--suite-select-multi-item-height');
    expect(css).toContain('--ant-select-multiple-item-height');
    expect(css).toContain('--ant-select-option-font-size');
    expect(css).toContain('.suite-typography');
    expect(css).toMatch(/@media\s*\(hover:\s*none\)/);
    expect(css).not.toContain('.ant-select-input');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getSelectPrefixCss('choices-$&', 'suite')).toContain('.choices-$&-input');
    expect(getSelectPrefixCss('choices-</style><script>', 'suite')).not.toContain('</style');
  });
});
