import { type QRCodeProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-qrcode-prefix-reference.json';
import QRCodePrefixFixtures from '../browser/fixtures/QRCodePrefixFixtures.svelte';
import type { QRCodePrefixSample } from '../browser/fixtures/qrcode-prefix-cases';

describe('QRCode local prefix public package', () => {
  it('pins source canvas/SVG statuses and preserves root and drawing identity observations', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(44);
    expect(reference.transitions.map(({ sameRoot, sameDrawing }) => [sameRoot, sameDrawing]))
      .toEqual([[true, true], [true, true], [true, true], [true, true]]);
  });

  it('publishes prefixCls and renders the cover, status and source SVG under the local prefix', () => {
    const props: Pick<QRCodeProps, 'prefixCls'> = { prefixCls: 'scan' };
    const sample = reference.cases.find(({ sample }) => sample.id === 'expired-svg-ltr')!
      .sample as QRCodePrefixSample;
    const rendered = render(QRCodePrefixFixtures, { props: { sample } });

    expect(props.prefixCls).toBe('scan');
    expect(rendered.body).toContain('class="scan ant-qrcode-css-var');
    expect(rendered.body).toContain('scan-cover');
    expect(rendered.body).toContain('scan-expired');
    expect(rendered.body).toContain('<svg');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('data-ant-svelte-theme="qrcode-prefix:scan"');
  });

  it('uses shared default CSS when the local prefix is empty', () => {
    const sample = reference.cases.find(({ sample }) => sample.id === 'empty-prefix-svg-ltr')!
      .sample as QRCodePrefixSample;
    const rendered = render(QRCodePrefixFixtures, { props: { sample } });

    expect(rendered.body).toContain('class="ant-qrcode ant-qrcode-css-var');
    expect(rendered.head).not.toContain('data-ant-svelte-theme="qrcode-prefix:');
  });
});
