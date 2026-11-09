import { describe, expect, it } from 'vitest';
import { getButtonPrefixCss } from './button-prefix.engine';

describe('Button prefix stylesheet', () => {
  it('keeps the default stylesheet for the default local and global prefixes', () => {
    expect(getButtonPrefixCss('ant-btn')).toBeUndefined();
  });

  it('isolates variants and Compact while keeping component token variables canonical', () => {
    const css = getButtonPrefixCss('action', 'suite')!;

    expect(css).toContain(
      '.action-color-primary:where([data-ant-button-prefix="action"][data-ant-button-global="suite"])'
    );
    expect(css).toContain('.action-compact-first-item');
    expect(css).toContain('.action-loading-icon-motion-enter-active');
    expect(css).toContain('--suite-btn-bg-color');
    expect(css).toContain('--ant-button-default-bg');
    expect(css).not.toContain('.ant-btn-icon');
    expect(css).not.toContain('.ant-btn-group');
  });

  it('supports canonical aliases, dot-free variable namespaces and safe style text', () => {
    expect(getButtonPrefixCss('ant-btn', 'suite')).toContain('--suite-btn-text-color');
    expect(getButtonPrefixCss('action', 'suite.scope')).toContain('--suitescope-btn-text-color');
    expect(getButtonPrefixCss('action-$&')).toContain('.action-$&-icon');
    expect(getButtonPrefixCss('action-</style><script>')).not.toContain('</style');
  });
});
