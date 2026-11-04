import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-skeleton-element-reference.json';

describe('Ant Design 6.6.8 Skeleton primitive reference', () => {
  it('pins official rendering and the inherited host typography', () => {
    expect(reference.reference).toMatchObject({
      version: '6.6.8',
      revision: '984592267de88fbf9cdaecc96a56629e721c709d',
      archiveSha256: '8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa',
      documentMode: 'CSS1Compat'
    });
    expect(reference.reference.source).toContain('frame inherits the same global design-token');
  });
});
