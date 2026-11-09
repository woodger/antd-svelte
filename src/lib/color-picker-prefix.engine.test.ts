import { describe, expect, it } from 'vitest';
import { getColorPickerPrefixCss } from './color-picker-prefix.engine';

describe('ColorPicker prefix stylesheet', () => {
  it('keeps canonical styling without an extra stylesheet', () => {
    expect(getColorPickerPrefixCss('ant-color-picker', 'ant')).toBeUndefined();
  });

  it('separates owner and shared child namespaces while preserving canonical variables', () => {
    const css = getColorPickerPrefixCss('colors', 'suite')!;

    expect(css).toContain('.colors-trigger:where([data-ant-color-picker-prefix="colors"][data-ant-color-picker-root-prefix="suite"])');
    expect(css).toContain('.ant-color-picker-css-var:where(');
    expect(css).toContain('[class^="colors"]');
    expect(css).toContain('.colors-inner .colors-presets .suite-collapse');
    expect(css).toContain('.suite-input-number-input');
    expect(css).toContain('.suite-select-content');
    expect(css).toContain('.suite-divider');
    expect(css).toContain('var(--ant-color-text)');
    expect(css).not.toContain('.ant-color-picker-inner');
  });

  it('keeps literal prefix text and escapes closing style tags', () => {
    expect(getColorPickerPrefixCss('colors-$&', 'suite')).toContain('.colors-$&-inner');
    expect(getColorPickerPrefixCss('colors-</style><script>', 'suite')).not.toContain('</style');
  });
});
