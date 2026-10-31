import { describe, expect, it } from 'vitest';
import { drawQRCode } from './qrcode.draw';

class TestPath {
  constructor(public path?: string) {}
  addPath() {}
}

function setup(path = true) {
  const calls: unknown[][] = [];
  const context = {
    fillStyle: '',
    globalAlpha: 1,
    scale: (...args: number[]) => calls.push(['scale', ...args]),
    fillRect: (...args: number[]) => calls.push(['rect', context.fillStyle, ...args]),
    fill: (value: TestPath) => calls.push(['path', context.fillStyle, value.path]),
    drawImage: (...args: unknown[]) => calls.push(['image', context.globalAlpha, ...args])
  };
  const canvas = {
    width: 0,
    height: 0,
    ownerDocument: { defaultView: { devicePixelRatio: 2, Path2D: path ? TestPath : undefined } },
    getContext: () => context
  };
  const settings = {
    modules: [[true, false], [false, true]],
    margin: 1,
    numCells: 4,
    image: null,
    size: 100,
    color: 'black',
    bgColor: 'white'
  };

  return { canvas, calls, settings };
}

describe('drawQRCode', () => {
  it('draws a DPR bitmap and a background before filling the module path', () => {
    const state = setup();

    drawQRCode(state.canvas as unknown as HTMLCanvasElement, state.settings);

    expect([state.canvas.width, state.canvas.height]).toEqual([200, 200]);
    expect(state.calls).toEqual([
      ['scale', 50, 50],
      ['rect', 'white', 0, 0, 4, 4],
      ['path', 'black', 'M1 1h1v1H1zM2,2 h1v1H2z']
    ]);
  });

  it('excavates only a successfully loaded icon and draws it after the modules', () => {
    const state = setup();
    const image = { complete: true, naturalWidth: 10, naturalHeight: 10 } as HTMLImageElement;
    const settings = { ...state.settings, image: {
      x: 0, y: 0, w: 1, h: 1, opacity: 0.5,
      excavation: { x: 0, y: 0, w: 1, h: 1 }, crossOrigin: 'anonymous' as const
    } };

    drawQRCode(state.canvas as unknown as HTMLCanvasElement, settings, image);

    expect(state.calls.slice(2)).toEqual([
      ['path', 'black', 'M2,2 h1v1H2z'],
      ['image', 0.5, image, 1, 1, 1, 1]
    ]);
    state.calls.length = 0;
    Object.defineProperty(image, 'naturalHeight', { value: 0 });

    drawQRCode(state.canvas as unknown as HTMLCanvasElement, settings, image);

    expect(state.calls.slice(2)).toEqual([
      ['path', 'black', 'M1 1h1v1H1zM2,2 h1v1H2z']
    ]);
  });

  it('retains unexcavated module rectangles in the pinned Path2D fallback', () => {
    const state = setup(false);

    drawQRCode(state.canvas as unknown as HTMLCanvasElement, { ...state.settings, image: {
      x: 0, y: 0, w: 2, h: 2, opacity: 1,
      excavation: { x: 0, y: 0, w: 2, h: 2 }, crossOrigin: undefined
    } }, { complete: true, naturalWidth: 10, naturalHeight: 10 } as HTMLImageElement);

    expect(state.calls.slice(2, 4)).toEqual([
      ['rect', 'black', 1, 1, 1, 1], ['rect', 'black', 2, 2, 1, 1]
    ]);
    expect(state.calls.at(-1)?.[0]).toBe('image');
  });

  it('leaves the bitmap untouched when a 2D context is unavailable', () => {
    const canvas = { width: 160, height: 160, getContext: () => null };

    drawQRCode(canvas as unknown as HTMLCanvasElement, setup().settings);

    expect([canvas.width, canvas.height]).toEqual([160, 160]);
  });
});
