import { describe, expect, it } from 'vitest';
import { getInputPrefixCss } from './input-prefix.engine';

describe('Input/TextArea prefix stylesheet', () => {
  it('keeps the default stylesheet for the default prefix', () => {
    expect(getInputPrefixCss('ant-input')).toBeUndefined();
  });

  it('isolates leaves and wrappers, preserves token names and excludes deprecated groups', () => {
    const css = getInputPrefixCss('field')!;

    expect(css).toContain('.field-affix-wrapper:where([data-ant-input-prefix="field"])');
    expect(css).toContain('textarea.field:where([data-ant-input-prefix="field"])');
    expect(css).toContain('resize:vertical');
    expect(css).toContain('.field-textarea-show-count');
    expect(css).toContain('.field-clear-icon-hidden');
    expect(css).toContain('--ant-input-padding-inline');
    expect(css).not.toContain('.ant-input-affix-wrapper');
    expect(css).not.toContain('.css-var-_R_0_');
    expect(css).not.toContain('.field-group');
    expect(css).not.toContain('.field-number');
  });

  it('substitutes literal prefix text and safely escapes style content', () => {
    expect(getInputPrefixCss('field-$&')).toContain('.field-$&-suffix');
    expect(getInputPrefixCss('field-</style><script>')).not.toContain('</style');
  });
});
