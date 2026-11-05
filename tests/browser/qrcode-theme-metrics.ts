export function snapshotQRCodeTheme() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-qrcode-theme]')]
    .map(host => {
      const root = host.querySelector<HTMLElement>('.ant-qrcode')!;
      const canvas = root.querySelector('canvas');
      const svg = root.querySelector<SVGSVGElement>(':scope > svg');
      const drawing = (canvas ?? svg)!;
      const cover = root.querySelector('.ant-qrcode-cover');
      const text = root.querySelector('.ant-qrcode-expired, .ant-qrcode-scanned');
      const style = (node: Element, fields: string[]) => {
        const css = getComputedStyle(node);
        return Object.fromEntries(fields.map(field => [field, css.getPropertyValue(field)]));
      };
      let palette: string[] | undefined;
      if (canvas) {
        // Readback copy не меняет режим 2D context production canvas.
        const copy = document.createElement('canvas');
        copy.width = canvas.width;
        copy.height = canvas.height;
        const context = copy.getContext('2d', { willReadFrequently: true })!;
        context.drawImage(canvas, 0, 0);
        const bytes = context.getImageData(0, 0, copy.width, copy.height).data;
        const colors = new Map<string, number>();
        for (let index = 0; index < bytes.length; index += 4) {
          if (!bytes[index + 3]) continue;
          const key = [...bytes.subarray(index, index + 4)].join(',');
          colors.set(key, (colors.get(key) ?? 0) + 1);
        }
        palette = [...colors].sort((left, right) => right[1] - left[1])
          .slice(0, host.dataset.qrcodeTheme === 'explicit' ? 2 : 1)
          .map(([key]) => key).sort();
      }

      return [host.dataset.qrcodeTheme!, {
        root: style(root, [
          'width', 'height', 'padding', 'color', 'background-color', 'font-size',
          'border-radius', 'border-width', 'border-style', 'border-color', 'direction'
        ]),
        drawing: {
          type: canvas ? 'canvas' : 'svg',
          width: drawing.getBoundingClientRect().width,
          height: drawing.getBoundingClientRect().height,
          bitmap: canvas ? [canvas.width, canvas.height] : null,
          palette: palette ?? null,
          fills: svg ? [...svg.querySelectorAll(':scope > path')]
            .map(path => getComputedStyle(path).fill) : null
        },
        cover: cover ? style(cover, [
          'width', 'height', 'background-color', 'color', 'font-size', 'line-height'
        ]) : null,
        text: text ? style(text, ['color', 'font-size', 'line-height']) : null
      }] satisfies [string, unknown];
    }));
}
