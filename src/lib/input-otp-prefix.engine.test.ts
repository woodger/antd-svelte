import { describe, expect, it } from 'vitest';
import { getInputOTPPrefixCss } from './input-otp-prefix.engine';

describe('InputOTP prefix stylesheet', () => {
  it('retains default CSS for the default prefix', () => {
    expect(getInputOTPPrefixCss('ant-otp')).toBeUndefined();
  });

  it('scopes root states, maps wrappers and masks, and preserves Input variables', () => {
    const css = getInputOTPPrefixCss('code')!;

    expect(css).toContain('.code:where([data-ant-otp-prefix="code"])');
    expect(css).toContain('.code-input-wrapper .code-mask-icon');
    expect(css).toContain('.code-mask-input[type=number]');
    expect(css).toContain('--ant-input-input-font-size');
    expect(css).not.toContain('.ant-otp-input');
    expect(css).not.toContain('.css-var-_R_0_');
  });

  it('substitutes literal prefixes and escapes style content', () => {
    expect(getInputOTPPrefixCss('code-$&')).toContain('.code-$&-input');
    expect(getInputOTPPrefixCss('code-</style><script>')).not.toContain('</style');
  });
});
