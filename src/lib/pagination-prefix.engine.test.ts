import { describe, expect, it } from 'vitest';
import { getPaginationPrefixCss } from './pagination-prefix.engine';

describe('Pagination prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getPaginationPrefixCss('ant-pagination', 'ant')).toBeUndefined();
  });

  it('isolates root/media/states and renames only private metrics while preserving canonical tokens', () => {
    const css = getPaginationPrefixCss('pages', 'suite')!;

    expect(css).toContain('.pages:where([data-ant-pagination-prefix="pages"][data-ant-pagination-root-prefix="suite"])');
    expect(css).toContain('.pages-small:where(');
    expect(css).toContain('.pages-item-active');
    expect(css).toContain('--suite-pagination-item-size-actual');
    expect(css).toContain('--suite-pagination-item-spacing-actual');
    expect(css).toContain('--ant-pagination-item-active-color');
    expect(css).toContain('.pages-options-size-changer');
    expect(css).not.toContain('.ant-input-group');
    expect(css).not.toContain('.ant-pagination-options');
    expect(getPaginationPrefixCss('ant-pagination', 'suite.root'))
      .toContain('--suiteroot-pagination-item-size-actual');
  });

  it('preserves literal prefix text and escapes closing style tags', () => {
    expect(getPaginationPrefixCss('pages-$&', 'suite')).toContain('.pages-$&-item');
    expect(getPaginationPrefixCss('pages-</style><script>', 'suite')).not.toContain('</style');
  });
});
