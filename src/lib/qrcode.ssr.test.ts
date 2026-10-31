import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import QRCode from './QRCode.svelte';
import type { StatusRenderInfo } from './qrcode.types';

describe('QRCode SSR', () => {
  it('omits an empty string and accepts an empty segment array', () => {
    expect(render(QRCode, { props: { value: '' } }).body).not.toContain('ant-qrcode');
    expect(render(QRCode, { props: { value: [], type: 'svg' } }).body)
      .toContain('viewBox="0 0 21 21"');
  });

  it('renders SVG paths and routes native title/data to root and aria/role to drawing', () => {
    const body = render(QRCode, { props: {
      value: 'test', type: 'svg', title: 'Root title', 'aria-label': 'Code', 'data-key': 'qr',
      children: createRawSnippet(() => ({ render: () => '<p>Ignored children</p>' }))
    } }).body;

    expect(body).toContain('data-key="qr"');
    expect(body).toMatch(/<div[^>]*title="Root title"/);
    expect(body).toMatch(/<svg[^>]*role="img"[^>]*aria-label="Code"/);
    expect(body).toContain('d="M0,0 h21v21H0z"');
    expect(body).toContain('fill="rgba(0, 0, 0, 0.88)"');
    expect(body).not.toContain('<title>');
    expect(body).not.toContain('Ignored children');
    expect(body).not.toContain('ant-qrcode-cover');
  });

  it('keeps plain dimensions above semantic geometry and leaves the SSR canvas unpainted', () => {
    const body = render(QRCode, { props: {
      value: 'test', size: 60, icon: 'icon.svg', bordered: false,
      styles: { root: 'width:999px;height:888px;color:red' },
      style: 'width:100%;height:80%'
    } }).body;

    expect(body).toContain('ant-qrcode-borderless');
    expect(body).toContain('width:999px;height:888px;color:red;width:100%;height:80%;width:100%;height:80%');
    expect(body).toMatch(/<canvas[^>]*width="60"[^>]*height="60"[^>]*style="width:100%;height:80%"/);
    expect(body).toContain('crossorigin="anonymous"');
    expect(body).toContain('alt="QR-Code"');
    expect(body).not.toContain('<path');
  });

  it(
    'renders localized status or the replacement snippet without publishing refresh events',
    () => {
      const events: string[] = [];
      const statusRender = createRawSnippet<[StatusRenderInfo]>(getInfo => {
        const info = getInfo();

        return { render: () => `<p>${info.status}: ${info.locale.scanned}</p>` };
      });
      const normal = render(QRCode, { props: {
        value: 'test', type: 'svg', status: 'expired', onRefresh: () => events.push('refresh')
      } }).body;
      const custom = render(QRCode, { props: {
        value: 'test', type: 'svg', status: 'scanned', statusRender
      } }).body;

      expect(normal).toContain('QR-код устарел');
      expect(normal).toContain('Обновить');
      expect(normal).toContain('anticon-reload');
      expect(custom).toContain('scanned: Отсканировано');
      expect(custom).not.toContain('ant-qrcode-scanned');
      expect(events).toEqual([]);
    }
  );
});
