import { describe, expect, it } from 'vitest';
import { getCarouselPrefixCss } from './carousel-prefix.engine';

describe('Carousel prefix stylesheet', () => {
  it('keeps the default stylesheet for the default class and global namespace', () => {
    expect(getCarouselPrefixCss('ant-carousel')).toBeUndefined();
  });

  it('isolates wrapper classes and duration keyframes from the delegated control prefix', () => {
    const css = getCarouselPrefixCss('gallery', 'suite')!;

    expect(css).toContain(
      '.gallery-vertical:where(.ant-carousel-css-var:where([data-ant-carousel-prefix="gallery"][data-ant-carousel-global="suite"]))'
    );
    expect(css).toContain('input.suite-radio-input');
    expect(css).toContain('input.suite-checkbox-input');
    expect(css).toContain('@keyframes gallery-dot-animation');
    expect(css).toContain('@keyframes gallery-dot-vertical-animation');
    expect(css).toContain('animation-name:gallery-dot-animation');
    expect(css).toContain('var(--dot-duration)');
    expect(css).toContain('--ant-carousel-dot-active-width');
    expect(css).toContain('.slick-slide');
    expect(css).not.toContain('input.ant-radio-input');
  });

  it('supports an explicit canonical class under a custom provider and escapes style text', () => {
    expect(getCarouselPrefixCss('ant-carousel', 'suite')).toContain('input.suite-radio-input');
    expect(getCarouselPrefixCss('ant-carousel-rtl', 'suite')).not.toContain('rtl-rtl-rtl');
    expect(getCarouselPrefixCss('gallery-$&')).toContain('.gallery-$&-vertical');
    expect(getCarouselPrefixCss('gallery-</style><script>')).not.toContain('</style');
  });
});
