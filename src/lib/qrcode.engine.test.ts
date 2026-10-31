import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import fixture from '../../tests/package/qrcode-vectors.json';
import { QrCode } from './qrcode-code.engine';
import { QrSegment } from './qrcode-segment.engine';
import { Ecc } from './qrcode-ecc.engine';
import {
  encodeQRCode,
  excavateQRCode,
  qrCodeAttributes,
  qrCodeDimensions,
  qrCodeImage,
  qrCodeMargin,
  qrCodePath
} from './qrcode.engine';
import type { QRCodeErrorLevel } from './qrcode.types';

describe('QRCode pinned package conformance', () => {
  it.each(fixture.vectors)('matches $name at $level with boost=$boost', vector => {
    const value = vector.value;
    const level = vector.level as QRCodeErrorLevel;
    const forced = vector as typeof vector & {
      minVersion?: number;
      maxVersion?: number;
      forcedMask?: number;
    };
    const levels = { L: Ecc.LOW, M: Ecc.MEDIUM, Q: Ecc.QUARTILE, H: Ecc.HIGH };
    const qr = forced.minVersion || forced.forcedMask !== undefined
      ? QrCode.encodeSegments(
        (Array.isArray(value) ? value : [value]).flatMap(text => QrSegment.makeSegments(text)),
        levels[level],
        forced.minVersion,
        forced.maxVersion,
        forced.forcedMask,
        vector.boost
      ) : encodeQRCode(value, level, vector.boost);
    const hash = createHash('sha256').update(JSON.stringify(qr.getModules())).digest('hex');

    expect([qr.version, qr.mask, qr.errorCorrectionLevel.ordinal])
      .toEqual([vector.version, vector.mask, vector.ecc]);
    expect(hash).toBe(vector.hash);
  });
});

describe('encodeQRCode', () => {
  it('keeps segmented numeric and byte payloads more compact than concatenating them', () => {
    const value = ['1234567890'.repeat(12), 'hello', '1234567890'.repeat(12)];
    const segmented = encodeQRCode(value);
    const joined = encodeQRCode(value.join(''));

    expect(segmented.version).toBeLessThan(joined.version);
    expect(encodeQRCode('test', 'L').errorCorrectionLevel).toBe(Ecc.HIGH);
    expect(encodeQRCode('test', 'L', false).errorCorrectionLevel).toBe(Ecc.LOW);
  });

  it('preserves capacity and Unicode failures instead of silently changing the payload', () => {
    expect(() => encodeQRCode('z'.repeat(2954), 'L', false)).toThrow('Data too long');
    expect(() => encodeQRCode('9'.repeat(7090), 'L', false)).toThrow('Data too long');
    expect(() => encodeQRCode('\ud800')).toThrow(URIError);
    expect(encodeQRCode([]).size).toBe(21);
  });
});

describe('QRCode path and image geometry', () => {
  it('coalesces horizontal runs with the exact pinned path syntax and quiet zone offset', () => {
    expect(qrCodePath([[true, true, false, true], [false, true, true, false]], 2))
      .toBe('M2 2h2v1H2zM5,2 h1v1H5zM3 3h2v1H3z');
    expect(qrCodePath([])).toBe('');
  });

  it('centers a rectangular icon in module coordinates and excavates all overlapping cells', () => {
    const modules = Array.from({ length: 21 }, () => Array<boolean>(21).fill(true));
    const image = qrCodeImage(modules, 160, 4, {
      src: 'icon.svg', width: 20, height: 40, excavate: true, crossOrigin: 'anonymous'
    })!;
    const cut = excavateQRCode(modules, image.excavation!);

    expect(image).toEqual({
      x: 8.6875,
      y: 6.875,
      w: 3.625,
      h: 7.25,
      excavation: { x: 8, y: 6, w: 5, h: 9 },
      opacity: 1,
      crossOrigin: 'anonymous'
    });
    expect(cut[6].slice(7, 14)).toEqual([true, false, false, false, false, false, true]);
    expect(cut[5]).toBe(modules[5]);
    expect(modules[6][8]).toBe(true);
  });

  it('retains zero-size fallback, explicit offsets, opacity and absent-image behavior', () => {
    const modules = [[true, true], [true, true]];
    const image = qrCodeImage(modules, 100, 0, {
      src: 'icon.svg', width: 0, height: 0, x: 20, y: 30, opacity: 0, excavate: false
    });

    expect(image).toEqual({
      x: 0.4, y: 0.6, w: 0.2, h: 0.2, opacity: 0, excavation: null, crossOrigin: undefined
    });
    expect(qrCodeImage(modules, 100, 0)).toBeNull();
    expect([undefined, 0, -1, 3.9].map(qrCodeMargin)).toEqual([0, 0, 0, 3]);
  });
});

describe('QRCode attribute and style boundaries', () => {
  it(
    'forwards role and aria to the drawing while retaining data title and events on the root',
    () => {
      const onclick = () => {};

      expect(qrCodeAttributes({ role: 'presentation', 'aria-label': 'Code', 'data-key': 'a',
        title: 'Root title', onclick })).toEqual({
        drawing: { role: 'presentation', 'aria-label': 'Code' },
        root: { 'data-key': 'a', title: 'Root title', onclick }
      });
    }
  );

  it('reads only plain dimensions without splitting quoted urls or calc expressions', () => {
    expect(qrCodeDimensions('width:100%;color:red;height:calc(100% - var(--gap, 2px));width:200px'))
      .toEqual({ width: '200px', height: 'calc(100% - var(--gap, 2px))' });
    expect(qrCodeDimensions('background:url("data:a;b:c");/*width:9px;*/height:80%;width:'))
      .toEqual({ height: '80%' });
    expect(qrCodeDimensions('width:100px!important;width:200px;height:var(--size,"/*literal*/")'))
      .toEqual({ width: '100px!important', height: 'var(--size,"/*literal*/")' });
    expect(qrCodeDimensions()).toEqual({});
  });
});
