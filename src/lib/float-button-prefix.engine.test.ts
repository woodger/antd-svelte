import { describe, expect, it } from 'vitest';
import { getFloatButtonPrefixCss } from './float-button-prefix.engine';

describe('FloatButton prefix stylesheet', () => {
  it('keeps the default stylesheet for the default owner and provider', () => {
    expect(getFloatButtonPrefixCss('ant-float-btn')).toBeUndefined();
  });

  it('isolates group states while keeping Button and progress namespaces independent', () => {
    const css = getFloatButtonPrefixCss('floating', 'suite')!;

    expect(css).toContain(
      '.floating-group-top:where([data-ant-float-prefix="floating"][data-ant-float-global="suite"])'
    );
    expect(css).toContain('[data-ant-float-root]{--suite-float-btn-size:');
    expect(css).toContain('.floating-badge-dot');
    expect(css).toContain('.suite-btn-disabled');
    expect(css).toContain('--suite-float-btn-progress');
    expect(css).toContain('--suite-btn-bg-color-hover');
    expect(css).toContain('--ant-control-height-lg');
    expect(css).not.toContain('.ant-float-btn-group');
  });

  it('keeps Compact margins outside the stronger geometry selector', () => {
    const css = getFloatButtonPrefixCss('floating', 'suite')!;
    const geometry = css.match(/\[data-ant-float-root\]\{([^}]+)\}/)?.[1];

    expect(geometry).toContain('height:auto;');
    expect(geometry).toContain('gap:calc(var(--ant-padding-xxs) / 2);');
    expect(geometry).not.toContain('margin:');
    expect(geometry).not.toContain('position:');
    expect(css).toContain('margin:0;');
  });

  it('supports canonical aliases, dot-free variables and safe style text', () => {
    expect(getFloatButtonPrefixCss('ant-float-btn', 'suite')).toContain('.suite-btn');
    expect(getFloatButtonPrefixCss('floating', 'suite.scope')).toContain('--suitescope-float-btn-size');
    expect(getFloatButtonPrefixCss('floating-$&')).toContain('.floating-$&-icon');
    expect(getFloatButtonPrefixCss('floating-</style><script>')).not.toContain('</style');
  });
});
