import { describe, expect, it } from 'vitest';
import { getTransferPrefixCss } from './transfer-prefix.engine';

describe('Transfer prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getTransferPrefixCss('ant-transfer', 'ant')).toBeUndefined();
  });

  it('isolates owner states and separates common control namespaces from tokens', () => {
    const css = getTransferPrefixCss('lists', 'suite')!;

    expect(css).toContain('.lists:where([data-ant-transfer-prefix="lists"][data-ant-transfer-root-prefix="suite"])');
    expect(css).toContain('.lists-status-error:where(');
    expect(css).toContain('.lists-list-content-item');
    expect(css).toContain('[class^="lists"]');
    expect(css).toContain('[class*=" lists"]');
    expect(css).toContain('.suite-btn');
    expect(css).toContain('.suite-input');
    expect(css).toContain('.suite-pagination-options');
    expect(css).toContain('.suite-table-wrapper');
    expect(css).toContain('--ant-transfer-list-width');
    expect(css).not.toContain('.ant-transfer-section');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getTransferPrefixCss('lists-$&', 'suite')).toContain('.lists-$&-section');
    expect(getTransferPrefixCss('lists-</style><script>', 'suite')).not.toContain('</style');
  });
});
