import { describe, expect, it } from 'vitest';
import { getBackTopStyle } from './back-top-style.engine';

describe('BackTop source runtime styles', () => {
  it('uses inclusive source maxima and isolates different prefixes and screens', () => {
    const normal = getBackTopStyle('ant-back-top', { screenMD: 768, screenXS: 480 });
    const custom = getBackTopStyle('owned-top', { screenMD: 900, screenXS: 600 });

    expect(normal.css).toContain('@media (max-width: 768px)');
    expect(normal.css).toContain('@media (max-width: 480px)');
    expect(custom.css).toContain('@media (max-width: 900px)');
    expect(custom.css).toContain('@media (max-width: 600px)');
    expect(custom.scope).not.toBe(normal.scope);
    expect(custom.css).toContain(`.owned-top:where(.${custom.scope})`);
    expect(custom.css).toContain('.owned-top-content');
    expect(custom.css).toContain('.ant-back-top-css-var:where(');
    expect(custom.css).toContain('--ant-back-top-z-index-popup');
    expect(custom.css).not.toContain('.css-var-r0');
    expect(custom.css).not.toContain(':where(.css-');
  });

  it('substitutes media in one pass when the new maxima equal each other’s defaults', () => {
    const { css } = getBackTopStyle('ant-back-top', { screenMD: 480, screenXS: 768 });

    expect([...css.matchAll(/@media \(max-width: ([\d.]+)px\)/g)].map(match => Number(match[1])))
      .toEqual([480, 768]);
  });

  it('keeps fractional and zero media and prevents an end-style prefix from ending the SSR style',
    () => {
      const { css } = getBackTopStyle('</style>', { screenMD: 700.5, screenXS: 0 });

      expect(css).toContain('@media (max-width: 700.5px)');
      expect(css).toContain('@media (max-width: 0px)');
      expect(css).not.toContain('</style>');
    });
});
