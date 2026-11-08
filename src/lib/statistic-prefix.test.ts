import { describe, expect, it } from 'vitest';
import { getStatisticPrefixCss } from './statistic-prefix.engine';

describe('Statistic prefix CSS boundary', () => {
  it('uses the shared sheet for the default prefix', () => {
    expect(getStatisticPrefixCss('ant-statistic')).toBeUndefined();
  });

  it('preserves token names and requires a custom root marker for alias prefixes', () => {
    const css = getStatisticPrefixCss('ant-statistic-content')!;

    expect(css).toContain('.ant-statistic-content:where([data-ant-statistic-prefix])');
    expect(css).toContain('.ant-statistic-css-var:where([data-ant-statistic-prefix])');
    expect(css).toContain('.ant-statistic-content-content-value');
    expect(css).toContain('--ant-statistic-content-font-size');
    expect(css).not.toContain('--ant-statistic-content-content-font-size');
  });

  it('keeps caller dollar text literal during selector replacement', () => {
    const css = getStatisticPrefixCss('metric-$&')!;

    expect(css).toContain('.metric-$&-header');
    expect(css).not.toContain('metric-.ant-statistic');
  });

  it('escapes closing style text in generated rules and native default overrides', () => {
    const css = getStatisticPrefixCss('metric</STYLE><script>')!;

    expect(css).not.toMatch(/<\/style/i);
    expect(css).toContain('<\\/style');
  });
});
