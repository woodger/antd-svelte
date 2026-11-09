import { describe, expect, it } from 'vitest';
import { getInputNumberPrefixCss } from './input-number-prefix.engine';

describe('InputNumber prefix stylesheet', () => {
  it('retains the default stylesheet for the default prefix', () => {
    expect(getInputNumberPrefixCss('ant-input-number')).toBeUndefined();
  });

  it('scopes roots and states while preserving descendants, variables and external icons', () => {
    const css = getInputNumberPrefixCss('meter')!;

    expect(css).toContain('.meter:where([data-ant-input-number-prefix="meter"])');
    expect(css).toContain('.meter-action-up');
    expect(css).toContain('.meter-mode-spinner');
    expect(css).toContain('--ant-input-number-handle-width');
    expect(css).not.toContain('.meter-addon');
    expect(css).not.toContain('.meter-group');
    expect(css).not.toContain('.css-var-_R_0_');
  });

  it('preserves literal prefix text and escapes style content', () => {
    expect(getInputNumberPrefixCss('meter-$&')).toContain('.meter-$&-input');
    expect(getInputNumberPrefixCss('meter-</style><script>')).not.toContain('</style');
  });
});
