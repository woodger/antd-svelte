import { describe, expect, it } from 'vitest';
import { getTreeSelectPrefixCss } from './tree-select-prefix.engine';

describe('TreeSelect prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getTreeSelectPrefixCss('ant-tree-select', 'ant')).toBeUndefined();
  });

  it('isolates dropdown scopes while retaining the Native Tree adapter and canonical tokens', () => {
    const css = getTreeSelectPrefixCss('choices', 'suite')!;

    expect(css).toContain('.choices-dropdown:where([data-ant-tree-select-prefix="choices"][data-ant-tree-select-root-prefix="suite"])');
    expect(css).toContain('[class^="choices"]');
    expect(css).toContain('.ant-tree-node-content-wrapper');
    expect(css).toContain('.suite-row');
    expect(css).toContain('--ant-tree-select-title-height');
    expect(css).not.toContain('.ant-tree-select-dropdown');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getTreeSelectPrefixCss('choices-$&', 'suite')).toContain('.choices-$&-dropdown');
    expect(getTreeSelectPrefixCss('choices-</style><script>', 'suite')).not.toContain('</style');
  });
});
