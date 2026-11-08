import { describe, expect, it } from 'vitest';
import { getStepsPrefixCss } from './steps-prefix.engine';

describe('Steps local prefix boundary', () => {
  it('uses the shared sheet by default and retains the Steps token namespace', () => {
    expect(getStepsPrefixCss('ant-steps')).toBeUndefined();
    const css = getStepsPrefixCss('pathway')!;

    expect(css).toContain('.pathway:where([data-ant-steps-prefix])');
    expect(css).toContain(':where(.ant-steps-css-var[data-ant-steps-prefix])');
    expect(css).toContain('--ant-cmp-steps-icon-size');
    expect(css).not.toContain('--pathway-icon-size');
  });

  it('isolates root states when the prefix aliases a built-in part or variable class', () => {
    for (const prefix of ['ant-steps-item', 'ant-steps-css-var']) {
      const css = getStepsPrefixCss(prefix)!;

      expect(css).toContain(`.${prefix}-vertical:where([data-ant-steps-prefix])`);
      expect(css).toContain(`.${prefix}-panel:where([data-ant-steps-prefix])`);
      expect(css).toContain(`.${prefix}-item-title`);
    }
  });

  it('keeps literal replacement text and escapes closing style tags', () => {
    const css = getStepsPrefixCss('pathway-$&</STYLE><script>')!;

    expect(css).toContain('pathway-$&<\\/style><script>-item');
    expect(css).not.toMatch(/<\/style/i);
  });
});
