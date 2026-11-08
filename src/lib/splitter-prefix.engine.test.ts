import { describe, expect, it } from 'vitest';
import { getSplitterPrefixCss } from './splitter-prefix.engine';

describe('Splitter prefix stylesheet', () => {
  it('keeps the default stylesheet and generates overrides for a changed root namespace', () => {
    expect(getSplitterPrefixCss('ant-splitter')).toBeUndefined();
    expect(getSplitterPrefixCss('ant-splitter', 'suite'))
      .toContain('var(--suite-splitter-bar-preview-offset)');
  });

  it('scopes owner styles and keeps component tokens separate from private preview variables', () => {
    const css = getSplitterPrefixCss('panes', 'suite.v1')!;

    expect(css).toContain('.panes:where([data-ant-splitter-prefix="panes"][data-ant-splitter-vars="suitev1"])');
    expect(css).toContain('.panes-horizontal:where(');
    expect(css).toContain('.panes-panel-hidden');
    expect(css).toContain('.panes-panel:has(.panes:only-child)');
    expect(css).toContain('.panes-bar-dragger-active');
    expect(css).toContain('var(--suitev1-splitter-bar-preview-offset)');
    expect(css).toContain('var(--ant-splitter-split-bar-size)');
    expect(css).toContain('.ant-splitter-css-var:where(');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).not.toContain('.ant-splitter-panel');
  });

  it('does not reprocess literal aliases or emit a closing style tag', () => {
    expect(getSplitterPrefixCss('ant-splitter-bar')).not.toContain('bar-bar-bar');
    expect(getSplitterPrefixCss('panes-$&')).toContain('.panes-$&-panel');
    expect(getSplitterPrefixCss('panes-</style><script>')).not.toContain('</style');
  });
});
