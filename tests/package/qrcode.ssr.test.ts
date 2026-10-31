import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { QRCode, type QRCodeProps } from 'antd-svelte';
import QRCodeFixtures from '../browser/fixtures/QRCodeFixtures.svelte';

describe('QRCode package SSR', () => {
  it('renders an SVG symbol with quiet zone and a centered icon through the public export', () => {
    const props: QRCodeProps = {
      value: ['0123456789', 'Ant Design'],
      type: 'svg',
      marginSize: 4,
      icon: 'icon.svg',
      iconSize: { width: 20, height: 40 },
      'aria-label': 'Server QR code'
    };

    const body = render(QRCode, { props }).body;

    expect(body).toContain('viewBox="0 0 33 33"');
    expect(body).toContain('aria-label="Server QR code"');
    expect(body).toContain('href="icon.svg"');
    expect(body).toContain('height="8.25"');
    expect(body).toContain('width="4.125"');
    expect(body).toContain('preserveAspectRatio="none"');
    expect(body).toContain('crossorigin="anonymous"');
    expect(body).not.toContain('<canvas');
  });

  it('renders inherited semantic config without measuring or painting the fixture canvas', () => {
    const body = render(QRCodeFixtures).body;

    expect(body).toContain('id="qrcode-fixture"');
    expect(body).toContain('qrcode-context context-canvas local-canvas');
    expect(body).toContain('outline-offset:2px;outline-offset:4px;width:999px;height:999px;width:160px;height:160px');
    expect(body).toContain('aria-label="Scannable QR code"');
    expect(body).toContain('aria-label="Reference QR code"');
    expect(body).toMatch(/<canvas[^>]*width="160"[^>]*height="160"/);
    expect(body).toContain('viewBox="0 0 21 21"');
  });
});
