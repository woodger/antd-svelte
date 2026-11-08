import { describe, expect, it } from 'vitest';
import { getQRCodePrefixCss } from './qrcode-prefix.engine';

describe('QRCode prefix CSS boundary', () => {
  it('uses the shared stylesheet for the default prefix', () => {
    expect(getQRCodePrefixCss('ant-qrcode')).toBeUndefined();
  });

  it('requires root markers for normal and borderless aliases while retaining token names', () => {
    const css = getQRCodePrefixCss('ant-qrcode-cover')!;

    expect(css).toContain('.ant-qrcode-cover:where([data-ant-qrcode-prefix])');
    expect(css).toContain('.ant-qrcode-cover-borderless:where([data-ant-qrcode-prefix])');
    expect(css).toContain(':where(.ant-qrcode-css-var[data-ant-qrcode-prefix])');
    expect(css).toContain('.ant-qrcode-cover-cover');
    expect(css).toContain('--ant-qr-code-qr-code-cover-background-color');
  });

  it('keeps replacement text literal and prevents closing a server-rendered style element', () => {
    const css = getQRCodePrefixCss('scan-$&</STYLE><script>')!;

    expect(css).toContain('scan-$&<\\/style><script>-cover');
    expect(css).not.toMatch(/<\/style/i);
    expect(css).not.toContain('scan-.ant-qrcode');
  });
});
