export function snapshotQRCodePrefix() {
  const style = (node: Element | null, fields: readonly string[]) => node
    ? Object.fromEntries(fields.map(key => [key, getComputedStyle(node).getPropertyValue(key)])) : null;

  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-qrcode-prefix]')]
    .map(host => {
      const root = host.firstElementChild!;
      const prefix = host.dataset.prefix!;
      const cover = root.querySelector(`.${prefix}-cover`);
      const text = root.querySelector(`.${prefix}-expired,.${prefix}-scanned`);
      const canvas = root.querySelector<HTMLCanvasElement>(':scope > canvas');
      const svg = root.querySelector<SVGSVGElement>(':scope > svg');
      const drawing = (canvas ?? svg)!;

      return [host.dataset.qrcodePrefix, {
        hasPrefix: root.classList.contains(prefix),
        hasDefaultPrefix: root.classList.contains('ant-qrcode'),
        borderless: root.classList.contains(`${prefix}-borderless`),
        root: style(root, [
          'width', 'height', 'padding', 'color', 'font-size', 'background-color',
          'border-radius', 'border-width', 'border-style', 'border-color', 'direction'
        ]),
        cover: style(cover, [
          'width', 'height', 'background-color', 'color', 'font-size', 'line-height'
        ]),
        text: style(text, ['color', 'font-size', 'line-height']),
        drawing: {
          type: canvas ? 'canvas' : 'svg',
          width: drawing.getBoundingClientRect().width,
          height: drawing.getBoundingClientRect().height,
          bitmap: canvas ? [canvas.width, canvas.height] : null
        }
      }];
    }));
}
