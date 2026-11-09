import { describe, expect, it } from 'vitest';
import { getRatePrefixCss } from './rate-prefix.engine';
import { getRateStarClass } from './rate.engine';

describe('Rate prefixes', () => {
  it('keeps default CSS and prefixes the active half and focus states', () => {
    expect(getRatePrefixCss('ant-rate')).toBeUndefined();
    expect(getRateStarClass(2, 2.5, true, true, 'review'))
      .toBe('review-star review-star-half review-star-active review-star-focused');
  });

  it('isolates root states and native button styles while retaining canonical tokens', () => {
    const css = getRatePrefixCss('review')!;

    expect(css).toContain('.review-disabled:where([data-ant-rate-prefix="review"])');
    expect(css).toContain('.review-star >button:hover');
    expect(css).toContain('.review-star-half .review-star-first');
    expect(css).toContain('[class^="review"]');
    expect(css).toContain('--ant-rate-star-size');
    expect(css).toContain('.ant-rate-css-var');
    expect(css).not.toContain('.ant-rate-star');
  });

  it('keeps literal replacement text and escapes closing style tags', () => {
    expect(getRatePrefixCss('review-$&')).toContain('.review-$&-star');
    expect(getRatePrefixCss('review-</style><script>')).not.toContain('</style');
  });
});
