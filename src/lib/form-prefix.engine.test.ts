import { describe, expect, it } from 'vitest';
import { getFormPrefixCss, getFormPrefixScope } from './form-prefix.engine';
import { createDesignTokenState, defaultThemeConfig } from './theme-config.engine';

const token = createDesignTokenState(defaultThemeConfig).token;

describe('Form prefix and media stylesheet', () => {
  it('retains default CSS for the default prefixes and media', () => {
    expect(getFormPrefixScope('ant-form', 'ant', token)).toBeUndefined();
    expect(getFormPrefixCss('ant-form', 'ant', token)).toBeUndefined();
  });

  it('separates Form parts, global Col selectors and private variables without renaming tokens', () => {
    const css = getFormPrefixCss('editor', 'suite', token)!;

    expect(css).toContain('.editor-item-label:where([data-ant-form-prefix=');
    expect(css).toContain('.suite-col-xs-24');
    expect(css).toContain('data-ant-col-xs-span="24"');
    expect(css).toContain('--suite-grid-display');
    expect(css).toContain('--suite-form-item-label-margin');
    expect(css).toContain('--ant-form-item-margin-bottom');
    expect(css).not.toContain('.ant-form-item-label');
    expect(css).not.toContain('.ant-motion-collapse');
  });

  it('isolates private namespaces and media while retaining alias-independent scope identity', () => {
    const scope = getFormPrefixScope('editor', 'suite', token);
    const media = { ...token, screenXSMax: 639, screenSMMax: 849 };

    expect(scope).not.toBe(getFormPrefixScope('editor', 'inner', token));
    expect(scope).not.toBe(getFormPrefixScope('editor', 'suite', media));
    expect(scope).toBe(getFormPrefixScope('editor', 'suite', { ...token, fontSize: 20 }));
    expect(getFormPrefixCss('ant-form', 'ant', media)).toContain('@media (max-width: 639px)');
    expect(getFormPrefixCss('editor', 'suite', media)).toContain('@media (max-width: 849px)');
  });

  it('keeps zero/fractional media, literal prefix text and safe style output', () => {
    const css = getFormPrefixCss('editor-$&', 'suite.custom', {
      ...token, screenXSMax: 0, screenSMMax: 700.5
    })!;

    expect(css).toContain('.editor-$&-item');
    expect(css).toContain('--suitecustom-grid-display');
    expect(css).toContain('@media (max-width: 0px)');
    expect(css).toContain('@media (max-width: 700.5px)');
    expect(getFormPrefixCss('editor-</style><script>', 'suite', token)).not.toContain('</style');
  });
});
