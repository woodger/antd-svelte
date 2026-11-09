import { describe, expect, it } from 'vitest';
import { getSwitchPrefixCss } from './switch-prefix.engine';

describe('Switch prefix stylesheet', () => {
  it('keeps the default stylesheet for the default prefix', () => {
    expect(getSwitchPrefixCss('ant-switch')).toBeUndefined();
  });

  it('isolates root states while keeping child parts and token names independent', () => {
    const css = getSwitchPrefixCss('toggle')!;

    expect(css).toContain('.toggle-checked:where([data-ant-switch-prefix="toggle"])');
    expect(css).toContain('.toggle-handle');
    expect(css).toContain('.toggle-inner-unchecked');
    expect(css).toContain('.toggle-loading-icon.anticon');
    expect(css).toContain('--ant-switch-handle-size');
    expect(css).not.toContain('.ant-switch-checked');
  });

  it('substitutes literal prefix text and escapes closing style tags', () => {
    expect(getSwitchPrefixCss('toggle-$&')).toContain('.toggle-$&-handle');
    expect(getSwitchPrefixCss('toggle-</style><script>')).not.toContain('</style');
  });
});
