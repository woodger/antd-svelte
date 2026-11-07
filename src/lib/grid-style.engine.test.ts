import { describe, expect, it } from 'vitest';
import { getGridMediaCss, getGridMediaScope } from './grid-style.engine';
import { createDesignTokenState, defaultThemeConfig } from './theme-config.engine';

const token = createDesignTokenState(defaultThemeConfig).token;

describe('Grid global responsive CSS', () => {
  it('keeps default CSS when only observer thresholds or component aliases change', () => {
    const observer = { ...token, screenMD: 800 };
    const component = { ...token, Grid: { screenMDMin: 900 } };

    expect(getGridMediaCss(token)).toBeUndefined();
    expect(getGridMediaScope(observer)).toBeUndefined();
    expect(getGridMediaCss(component)).toBeUndefined();
  });

  it('replaces every media boundary in one pass even when new minima equal old breakpoints', () => {
    const sizes = [768, 992, 1200, 1600, 1920, 2560];
    const keys = [
      'screenSMMin', 'screenMDMin', 'screenLGMin', 'screenXLMin', 'screenXXLMin', 'screenXXXLMin'
    ];
    const configured = { ...token, ...Object.fromEntries(keys.map((key, i) => [key, sizes[i]])) };
    const css = getGridMediaCss(configured)!;

    expect([...css.matchAll(/@media \(min-width: ([\d.]+)px\)/g)].map(match => Number(match[1])))
      .toEqual(sizes);
    expect(css).not.toContain('__ANT_GRID_MEDIA_SCOPE__');
    expect(css).toContain(`.ant-col-md-0:where(.${getGridMediaScope(configured)}){display:none;}`);
    expect(css).toContain('.ant-col-xs-24:where(');
    expect(css).toContain('.ant-col-lg-flex:where(');
    expect(css).toContain('inset-inline-start:auto;');
    expect(css).toContain('order:0;');
  });

  it('isolates different media while sharing a scope for identical thresholds', () => {
    const first = { ...token, screenMDMin: 900 };
    const second = { ...token, screenMDMin: 1000 };

    expect(getGridMediaScope(first)).not.toBe(getGridMediaScope(second));
    expect(getGridMediaCss(first)).not.toContain(`.${getGridMediaScope(second)}`);
    const aliases = { ...first, fontSize: 24 };
    expect(getGridMediaScope(aliases)).toBe(getGridMediaScope(first));
  });

  it('keeps zero and fractional minima and prevents token text from becoming CSS syntax', () => {
    expect(getGridMediaCss({ ...token, screenSMMin: 0, screenMDMin: 700.5 }))
      .toContain('@media (min-width: 0px)');
    expect(getGridMediaCss({ ...token, screenMDMin: 700.5 }))
      .toContain('@media (min-width: 700.5px)');
    const invalid = { ...token, screenMDMin: '0px)</style>' as unknown as number };

    expect(getGridMediaCss(invalid)).not.toContain('</style>');
    expect(getGridMediaScope(invalid)).toMatch(/^ant-grid-media-[a-z0-9]+$/);
  });
});
