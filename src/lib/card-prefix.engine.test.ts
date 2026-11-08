import { describe, expect, it } from 'vitest';
import { getCardPrefixCss } from './card-prefix.engine';

describe('Card prefix stylesheet', () => {
  it('keeps the default stylesheet for the default owner and global prefix', () => {
    expect(getCardPrefixCss('ant-card')).toBeUndefined();
  });

  it('isolates Card/Grid/Meta styles and keeps delegated namespaces independent', () => {
    const css = getCardPrefixCss('panel', 'suite')!;

    expect(css).toContain(
      '.panel-small:where([data-ant-card-prefix="panel"][data-ant-card-global="suite"])'
    );
    expect(css).toContain('.panel-grid-hoverable');
    expect(css).toContain('.panel-meta-description');
    expect(css).toContain('.suite-typography');
    expect(css).toContain('.suite-tabs-top');
    expect(css).toContain('--ant-card-header-padding');
    expect(css).not.toContain('.ant-card-body');
  });

  it('supports a canonical local class in a different provider and escapes style text', () => {
    expect(getCardPrefixCss('ant-card', 'suite')).toContain('.suite-tabs-top');
    expect(getCardPrefixCss('ant-card-meta')).not.toContain('meta-meta-meta');
    expect(getCardPrefixCss('panel-$&')).toContain('.panel-$&-body');
    expect(getCardPrefixCss('panel-</style><script>')).not.toContain('</style');
  });
});
