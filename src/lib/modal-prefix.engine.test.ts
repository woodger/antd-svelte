import { describe, expect, it } from 'vitest';
import { getModalPrefixCss } from './modal-prefix.engine';

describe('Modal prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getModalPrefixCss('ant-modal', 'ant')).toBeUndefined();
  });

  it('isolates modal/confirm roots and separates global Button selectors from local width variables', () => {
    const css = getModalPrefixCss('window', 'suite')!;

    expect(css).toContain('.window:where([data-ant-modal-prefix="window"][data-ant-modal-root-prefix="suite"])');
    expect(css).toContain('.window-confirm:where(');
    expect(css).toContain('.window-confirm-success:where(');
    expect(css).toContain('.window-footer >.suite-btn+.suite-btn');
    expect(css).toContain('--window-xs-width');
    expect(css).toContain('--ant-modal-content-bg');
    expect(css).not.toContain('.ant-modal-body');
    expect(getModalPrefixCss('ant-modal', 'suite')).toContain('.suite-btn');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getModalPrefixCss('window-$&', 'suite')).toContain('.window-$&-close');
    expect(getModalPrefixCss('window-</style><script>', 'suite')).not.toContain('</style');
  });
});
