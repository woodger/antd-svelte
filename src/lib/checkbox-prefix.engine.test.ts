import { describe, expect, it } from 'vitest';
import { getCheckboxPrefixCss } from './checkbox-prefix.engine';

describe('Checkbox prefix stylesheet', () => {
  it('keeps the default stylesheet for the default local and global prefixes', () => {
    expect(getCheckboxPrefixCss('ant-checkbox')).toBeUndefined();
  });

  it('isolates roots, keeps child states local and preserves the independent Row namespace', () => {
    const css = getCheckboxPrefixCss('choice', 'suite')!;

    expect(css).toContain(
      '.choice-wrapper:where([data-ant-checkbox-prefix="choice"][data-ant-checkbox-global="suite"])'
    );
    expect(css).toContain('.choice-indeterminate');
    expect(css).toContain('.choice-disabled');
    expect(css).toContain('.suite-row');
    expect(css).toContain('--ant-control-interactive-size');
    expect(css).not.toContain('.ant-checkbox-wrapper');
  });

  it('supports canonical aliases and safely substitutes literal prefix text', () => {
    expect(getCheckboxPrefixCss('ant-checkbox', 'suite')).toContain('.suite-row');
    expect(getCheckboxPrefixCss('choice-$&')).toContain('.choice-$&-input');
    expect(getCheckboxPrefixCss('choice-</style><script>')).not.toContain('</style');
  });
});
