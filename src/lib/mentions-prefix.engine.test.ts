import { describe, expect, it } from 'vitest';
import { getMentionsPrefixCss } from './mentions-prefix.engine';

describe('Mentions prefix stylesheet', () => {
  it('keeps the default stylesheet for default local/global prefixes', () => {
    expect(getMentionsPrefixCss('ant-mentions', 'ant')).toBeUndefined();
  });

  it('isolates editor/popup parts and private variables while retaining component tokens', () => {
    const css = getMentionsPrefixCss('mention', 'suite')!;

    expect(css).toContain('.mention-dropdown:where([data-ant-mentions-prefix="mention"]');
    expect(css).toContain('.mention-dropdown-menu-item-disabled');
    expect(css).toContain('--suite-cmp-mentions-control-height');
    expect(css).toContain('.suite-form-item-feedback-icon');
    expect(css).toContain('--ant-mentions-padding-inline');
    expect(css).toContain('[class^="mention"]');
    expect(css).not.toContain('.ant-mentions-measure');
  });

  it('retains canonical local classes with custom global namespace and literal substitutions', () => {
    expect(getMentionsPrefixCss('ant-mentions', 'suite.custom')).toContain('--suitecustom-cmp-mentions-');
    expect(getMentionsPrefixCss('mention-$&', 'suite')).toContain('.mention-$&-measure');
    expect(getMentionsPrefixCss('mention-</style><script>', 'suite')).not.toContain('</style');
  });
});
