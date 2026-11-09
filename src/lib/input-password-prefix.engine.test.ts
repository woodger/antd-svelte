import { describe, expect, it } from 'vitest';
import { getInputPasswordPrefixCss } from './input-password-prefix.engine';

describe('InputPassword prefix stylesheet', () => {
  it('retains the default stylesheet when both namespaces are default', () => {
    expect(getInputPasswordPrefixCss('ant-input', 'ant-input-password')).toBeUndefined();
  });

  it('targets the independent icon within its own Input root and preserves token variables', () => {
    const css = getInputPasswordPrefixCss('field', 'secret')!;

    expect(css).toContain('.field-affix-wrapper:where(.secret) .secret-icon');
    expect(css).toContain('.field-affix-wrapper-disabled:where(.secret) .secret-icon:hover');
    expect(css).toContain('--ant-color-icon-hover');
    expect(css).not.toContain('.ant-input');
  });

  it('substitutes literal prefixes and escapes style content', () => {
    expect(getInputPasswordPrefixCss('field-$&', 'secret-$&')).toContain('.secret-$&-icon');
    expect(getInputPasswordPrefixCss('field', 'secret-</style><script>'))
      .not.toContain('</style');
  });
});
