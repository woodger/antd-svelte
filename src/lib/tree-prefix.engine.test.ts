import { describe, expect, it } from 'vitest';
import { getTreePrefixCss } from './tree-prefix.engine';

describe('Tree prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getTreePrefixCss('ant-tree', 'ant')).toBeUndefined();
  });

  it('isolates local nodes/lines/checkboxes and separates the common Row namespace', () => {
    const css = getTreePrefixCss('nodes', 'suite')!;

    expect(css).toContain('.nodes:where([data-ant-tree-prefix="nodes"][data-ant-tree-root-prefix="suite"])');
    expect(css).toContain('.nodes-show-line:where(');
    expect(css).toContain('.nodes-rtl:where(');
    expect(css).toContain('.nodes-checkbox-checked');
    expect(css).toContain('.suite-row');
    expect(css).toContain('--ant-tree-title-height');
    expect(css).toContain('--rc-virtual-list-scrollbar-bg');
    expect(css).not.toContain('.ant-tree-treenode');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getTreePrefixCss('nodes-$&', 'suite')).toContain('.nodes-$&-checkbox');
    expect(getTreePrefixCss('nodes-</style><script>', 'suite')).not.toContain('</style');
  });
});
