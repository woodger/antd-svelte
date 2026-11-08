import { describe, expect, it } from 'vitest';
import { getTypographyPrefixCss } from './typography-prefix.engine';

describe('Typography prefix stylesheet', () => {
  it('keeps the existing stylesheet for the default prefix', () => {
    expect(getTypographyPrefixCss('ant-typography')).toBeUndefined();
  });

  it('rewrites headings, decorations, actions, editing and ellipsis in the owner token scope', () => {
    const css = getTypographyPrefixCss('prose')!;

    expect(css).toContain(
      '.prose:where(.ant-typography-css-var:where([data-ant-typography-prefix="prose"]))'
    );
    expect(css).toContain('.prose-edit-content');
    expect(css).toContain('.prose-copy-success');
    expect(css).toContain('.prose-ellipsis-single-line');
    expect(css).toContain('var(--ant-typography-title-margin-top)');
    expect(css).not.toContain('.ant-typography-copy');
  });

  it('keeps literal replacements and escapes closing style text', () => {
    expect(getTypographyPrefixCss('ant-typography-copy')).not.toContain('copy-copy-copy');
    expect(getTypographyPrefixCss('prose-$&')).toContain('.prose-$&-edit');
    expect(getTypographyPrefixCss('prose-</style><script>')).not.toContain('</style');
  });
});
