import { describe, expect, it } from 'vitest';
import { getMasonryPrefixCss } from './masonry-prefix.engine';

describe('Masonry prefix stylesheet', () => {
  it('keeps the existing vendor stylesheet for the default prefix', () => {
    expect(getMasonryPrefixCss('ant-masonry')).toBeUndefined();
  });

  it('scopes root aliases and rewrites items and motion without renaming token markers', () => {
    const css = getMasonryPrefixCss('tiles')!;

    expect(css).toContain('.tiles:where([data-ant-masonry-prefix="tiles"])');
    expect(css).toContain('.tiles-rtl:where([data-ant-masonry-prefix="tiles"])');
    expect(css).toContain('.tiles-item-fade-appear-active');
    expect(css).toContain('.tiles-item-fade-leave-active');
    expect(css).toContain('.ant-masonry-css-var:where([data-ant-masonry-prefix="tiles"])');
    expect(css).toContain('var(--ant-motion-duration-slow)');
    expect(css).not.toContain('.ant-masonry-item');
    expect(css).not.toContain('.tiles-css-var');
  });

  it('keeps literal aliases independent and escapes closing style text', () => {
    const marker = getMasonryPrefixCss('ant-masonry-css-var')!;

    expect(marker).toContain('[data-ant-masonry-prefix="ant-masonry-css-var"]');
    expect(getMasonryPrefixCss('ant-masonry-item')).not.toContain('item-item-item');
    expect(getMasonryPrefixCss('tiles-$&')).toContain('.tiles-$&-item');
    expect(getMasonryPrefixCss('tiles-</style><script>')).not.toContain('</style');
  });
});
