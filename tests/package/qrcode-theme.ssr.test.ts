import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-qrcode-theme-reference.json';
import QRCodeThemeCase from '../browser/fixtures/QRCodeThemeCase.svelte';

describe('QRCode theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} as SVG and canvas shells without DOM, refs, refreshes or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(QRCodeThemeCase, { props: { sample } });

        expect(body).toContain('data-qrcode-theme="svg"');
        expect(body).toContain('data-qrcode-theme="canvas"');
        expect(body).toContain('QRCode theme ref canvas">empty</output>');
        expect(body).toContain('QRCode theme refresh custom">0</output>');
        expect(body).toContain('viewBox="0 0');
        expect(body).toContain('<canvas');
        if (sample.name === 'undefined-global-text') expect(body).toContain('fill="#000000"');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
