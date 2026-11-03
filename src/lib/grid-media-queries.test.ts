import { describe, expect, it } from 'vitest';
import { getGridMediaQueries } from './grid.engine';

const token = {
  screenXS: 180, screenXSMin: 160, screenXSMax: 299,
  screenSM: 320, screenSMMin: 300, screenSMMax: 499,
  screenMD: 520, screenMDMin: 500, screenMDMax: 699,
  screenLG: 720, screenLGMin: 700, screenLGMax: 899,
  screenXL: 920, screenXLMin: 900, screenXLMax: 1299,
  screenXXL: 1320, screenXXLMin: 1300, screenXXLMax: 1499,
  screenXXXL: 1520, screenXXXLMin: 1500
};

describe('getGridMediaQueries', () => {
  it('uses the XS maximum and the remaining screen thresholds including XXXL', () => {
    expect(getGridMediaQueries(token)).toEqual({
      xs: '(max-width: 299px)',
      sm: '(min-width: 320px)',
      md: '(min-width: 520px)',
      lg: '(min-width: 720px)',
      xl: '(min-width: 920px)',
      xxl: '(min-width: 1320px)',
      xxxl: '(min-width: 1520px)'
    });
  });

  it('allows equality and deliberate gaps between the maximum and next threshold', () => {
    const result = getGridMediaQueries({ ...token, screenXSMax: 300, screenSM: 350 });

    expect(result.xs).toBe('(max-width: 300px)');
    expect(result.sm).toBe('(min-width: 350px)');
  });

  it.each([
    { override: { screenSMMin: 350 }, error: 'screenSMMin<=screenSM fails : !(350<=320)' },
    { override: { screenMD: 710 }, error: 'screenMD<=screenMDMax fails : !(710<=699)' },
    { override: { screenXLMax: 1310 }, error: 'screenXLMax<=screenXXLMin fails : !(1310<=1300)' },
    { override: { screenXXXLMin: 1530 }, error: 'screenXXXLMin<=screenXXXL fails : !(1530<=1520)' }
  ])('rejects invalid screen ordering: $error', ({ override, error }) => {
    expect(() => getGridMediaQueries({ ...token, ...override })).toThrow(error);
  });
});
