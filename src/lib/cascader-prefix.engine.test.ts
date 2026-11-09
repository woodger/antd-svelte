import { describe, expect, it } from 'vitest';
import { getCascaderPrefixCss } from './cascader-prefix.engine';

describe('Cascader prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getCascaderPrefixCss('ant-cascader', 'ant-select', 'ant')).toBeUndefined();
  });

  it('isolates dropdown/panel scopes and separates Select/Row namespaces from canonical tokens', () => {
    const css = getCascaderPrefixCss('paths', 'choices', 'suite')!;

    expect(css).toContain('.paths-dropdown:where([data-ant-cascader-prefix="paths"][data-ant-cascader-select-prefix="choices"][data-ant-cascader-root-prefix="suite"])');
    expect(css).toContain('.choices-dropdown:where(');
    expect(css).toContain('.paths-panel:where(');
    expect(css).toContain('.paths-menu-item');
    expect(css).toContain('[class^="paths"]');
    expect(css).toContain('.suite-row');
    expect(css).toContain('--ant-cascader-control-item-width');
    expect(css).not.toContain('.ant-cascader-menu');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getCascaderPrefixCss('paths-$&', 'choices', 'suite')).toContain('.paths-$&-menu');
    expect(getCascaderPrefixCss('paths-</style><script>', 'choices', 'suite'))
      .not.toContain('</style');
  });
});
