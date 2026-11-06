export function traceWatermarkTheme() {
  const trace = { text: [] as { text: string; font: string; color: string; align: string; }[] };
  Object.assign(window, { watermarkThemeTrace: trace });
  const draw = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
    trace.text.push({ text, font: this.font, color: String(this.fillStyle), align: this.textAlign });
    if (maxWidth === undefined) draw.call(this, text, x, y);
    else draw.call(this, text, x, y, maxWidth);
  };
}

export async function snapshotWatermarkTheme() {
  const trace = (window as unknown as {
    watermarkThemeTrace: { text: { text: string; font: string; color: string; align: string; }[] };
  }).watermarkThemeTrace;
  const result: Record<string, unknown> = {};
  for (const host of document.querySelectorAll<HTMLElement>('[data-watermark-theme]')) {
    const id = host.dataset.watermarkTheme!;
    const root = host.querySelector<HTMLElement>('.theme-watermark')!;
    const mark = root.querySelector<HTMLElement>(':scope > div[style*="background-image"]');
    if (!mark) { result[id] = null; continue; }
    const css = getComputedStyle(mark);
    const url = /url\(["']?(.*?)["']?\)/.exec(css.backgroundImage)![1];
    const image = new Image();
    image.src = url;
    await image.decode();
    // Читается копия PNG, режим production Canvas не меняется.
    const copy = document.createElement('canvas');
    copy.width = image.width;
    copy.height = image.height;
    const context = copy.getContext('2d', { willReadFrequently: true })!;
    context.drawImage(image, 0, 0);
    const bytes = context.getImageData(0, 0, copy.width, copy.height).data;
    let peakAlpha = 0;
    for (let index = 3; index < bytes.length; index += 4) peakAlpha = Math.max(peakAlpha, bytes[index]);
    result[id] = {
      mark: Object.fromEntries([
        'position', 'z-index', 'left', 'top', 'width', 'height', 'pointer-events',
        'background-repeat', 'background-size', 'background-position', 'visibility'
      ].map(name => [name, css.getPropertyValue(name)])),
      bitmap: { width: image.width, height: image.height, peakAlpha },
      text: trace.text.filter(line => line.text.startsWith(`${id}:`)).slice(id === 'lines' ? -3 : -1)
    };
  }
  return result;
}
