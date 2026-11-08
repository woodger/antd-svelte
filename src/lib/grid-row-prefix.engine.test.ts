import { describe, expect, it } from 'vitest';
import { getGridRowPrefixCss } from './grid-row-prefix.engine';

describe('Grid Row prefix stylesheet', () => {
  it('keeps existing default styles and isolates local layout classes', () => {
    expect(getGridRowPrefixCss('ant-row')).toBeUndefined();
    const css = getGridRowPrefixCss('line')!;

    expect(css).toContain('.line:where([data-ant-grid-row-prefix="line"])');
    expect(css).toContain('.line-no-wrap:where(');
    expect(css).toContain('.line-space-between:where(');
    expect(css).toContain('.line-middle:where(');
    expect(css).toContain('.ant-grid-css-var');
    expect(css).not.toContain('.ant-col');
  });

  it('preserves literal replacements and escapes closing style text', () => {
    expect(getGridRowPrefixCss('ant-row-line')).not.toContain('line-line-line');
    expect(getGridRowPrefixCss('line-$&')).toContain('.line-$&-middle');
    expect(getGridRowPrefixCss('line-</style><script>')).not.toContain('</style');
  });
});
