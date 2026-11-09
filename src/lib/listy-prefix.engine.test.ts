import { describe, expect, it } from 'vitest';
import { getListyPrefixCss } from './listy-prefix.engine';

describe('Listy prefix stylesheet', () => {
  it('keeps the default stylesheet for the default prefix', () => {
    expect(getListyPrefixCss('ant-listy')).toBeUndefined();
  });

  it('isolates raw/virtual parts while retaining canonical tokens and scrollbar variables', () => {
    const css = getListyPrefixCss('records')!;

    expect(css).toContain('.records:where([data-ant-listy-prefix="records"])');
    expect(css).toContain('.records-group-header-sticky');
    expect(css).toContain('.records-group-header-fixed');
    expect(css).toContain('.records-scrollbar:hover');
    expect(css).toContain('[class^="records"]');
    expect(css).toContain('--rc-virtual-list-scrollbar-bg');
    expect(css).toContain('--ant-listy-item-padding-block');
    expect(css).not.toContain('.ant-listy-item');
  });

  it('keeps literal replacement text and escapes closing style tags', () => {
    expect(getListyPrefixCss('records-$&')).toContain('.records-$&-item');
    expect(getListyPrefixCss('records-</style><script>')).not.toContain('</style');
  });
});
