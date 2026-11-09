import { describe, expect, it } from 'vitest';
import { getTablePrefixCss } from './table-prefix.engine';

describe('Table prefix stylesheet', () => {
  it('keeps canonical styling without an additional sheet', () => {
    expect(getTablePrefixCss('ant-table', 'ant')).toBeUndefined();
  });

  it('isolates owner and shared namespaces while preserving component tokens', () => {
    const css = getTablePrefixCss('grid', 'suite')!;

    expect(css).toContain('.grid-wrapper:where([data-ant-table-prefix="grid"]'
      + '[data-ant-table-root-prefix="suite"])');
    expect(css).toContain('.suite-pagination');
    expect(css).toContain('.suite-checkbox-wrapper');
    expect(css).toContain('.suite-descriptions-view');
    expect(css).toContain('--suite-table-nested-border-top');
    expect(css).toContain('--ant-table-header-bg');
    expect(css).toContain('[class^="grid"]');
    expect(css).not.toContain('.ant-table-thead');
    expect(css).toMatch(/:where\(\.ant-table-css-var[^\n]+\)\{--ant-table-/);
  });

  it('keeps a canonical owner independent from shared children and escapes style tags', () => {
    const css = getTablePrefixCss('ant-table', 'suite')!;

    expect(css).toContain('.ant-table-wrapper:where(');
    expect(css).toContain('.suite-checkbox-wrapper');
    expect(getTablePrefixCss('grid-$&', 'suite')).toContain('.grid-$&-cell');
    expect(getTablePrefixCss('grid-</style><script>', 'suite')).not.toContain('</style');
  });
});
