import { describe, expect, it } from 'vitest';
import { getRadioPrefixCss } from './radio-prefix.engine';

describe('Radio prefix stylesheet', () => {
  it('keeps the default stylesheet for default local and global prefixes', () => {
    expect(getRadioPrefixCss('ant-radio')).toBeUndefined();
  });

  it('isolates all three modes and preserves tokens and the global Badge namespace', () => {
    const css = getRadioPrefixCss('choice', 'suite')!;

    expect(css).toContain(
      '.choice-button-wrapper:where([data-ant-radio-prefix="choice"][data-ant-radio-global="suite"])'
    );
    expect(css).toContain('.choice-group-solid');
    expect(css).toContain('.choice-input');
    expect(css).toContain('.suite-badge-count');
    expect(css).toContain('--ant-radio-button-bg');
    expect(css).not.toContain('.ant-radio-wrapper');
    expect(css).not.toContain('.suite-button-wrapper');
  });

  it('supports canonical aliases and safely substitutes literal prefix text', () => {
    expect(getRadioPrefixCss('ant-radio', 'suite')).toContain('.suite-badge');
    expect(getRadioPrefixCss('choice-$&')).toContain('.choice-$&-button-wrapper');
    expect(getRadioPrefixCss('choice-</style><script>')).not.toContain('</style');
  });
});
