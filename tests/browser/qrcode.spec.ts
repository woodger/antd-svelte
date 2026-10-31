import type { Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.locator('.fixture-qrcode');
const canvas = (page: Page) => root(page).locator('canvas');
const select = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const png = (page: Page) => canvas(page).evaluate((node: HTMLCanvasElement) => node.toDataURL());
const centerPixel = (page: Page) => canvas(page).evaluate((node: HTMLCanvasElement) => {
  const copy = document.createElement('canvas');
  copy.width = copy.height = 1;
  const context = copy.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(node, Math.floor(node.width / 2), Math.floor(node.height / 2), 1, 1, 0, 0, 1, 1);

  return [...context.getImageData(0, 0, 1, 1).data];
});

async function expectMatchingModules(page: Page) {
  await expect.poll(() => page.evaluate(async () => {
    const canvas = document.querySelector<HTMLCanvasElement>('.fixture-qrcode canvas')!;
    const reference = document.querySelector<SVGSVGElement>('.reference-qrcode svg')!;
    const svg = reference.cloneNode(true) as SVGSVGElement;
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const url = URL.createObjectURL(new Blob([svg.outerHTML], { type: 'image/svg+xml' }));
    const image = new Image();

    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('SVG rasterization failed'));
        image.src = url;
      });
      const raster = document.createElement('canvas');
      raster.width = canvas.width;
      raster.height = canvas.height;
      const rasterContext = raster.getContext('2d', { willReadFrequently: true })!;
      rasterContext.drawImage(image, 0, 0, raster.width, raster.height);
      const copy = document.createElement('canvas');
      copy.width = canvas.width;
      copy.height = canvas.height;
      const copyContext = copy.getContext('2d', { willReadFrequently: true })!;
      copyContext.drawImage(canvas, 0, 0);
      const actual = copyContext.getImageData(0, 0, copy.width, copy.height).data;
      const expected = rasterContext.getImageData(0, 0, raster.width, raster.height).data;
      const count = reference.viewBox.baseVal.width;
      let mismatches = 0;

      // Центры модулей не зависят от различий antialias между Canvas paths и crispEdges SVG.
      for (let y = 0; y < count; y++)
        for (let x = 0; x < count; x++) {
          const px = Math.floor((x + 0.5) * canvas.width / count);
          const py = Math.floor((y + 0.5) * canvas.height / count);
          const index = (py * canvas.width + px) * 4;

          if ([0, 1, 2, 3].some(
            channel => Math.abs(actual[index + channel] - expected[index + channel]) > 2
          ))
            mismatches++;
        }

      return mismatches;
    } finally {
      URL.revokeObjectURL(url);
    }
  })).toBe(0);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=qrcode');
  const ratio = await page.evaluate(() => window.devicePixelRatio || 1);
  await expect(canvas(page)).toHaveAttribute('width', String(160 * ratio));
  await expect(control(page, 'QRCode ref')).toHaveText('DIV');
});

test(
  'QRCode draws the pinned modules on canvas and keeps aria and native attributes at their source boundaries',
  async ({ page }) => {
    await expect(root(page)).toHaveCSS('width', '160px');
    await expect(root(page)).toHaveCSS('height', '160px');
    await expect(root(page)).toHaveAttribute('title', 'QR root title');
    await expect(root(page)).toHaveAttribute('data-marker', 'qr-root');
    await expect(root(page)).not.toHaveAttribute('aria-label');
    await expect(canvas(page)).toHaveAttribute('aria-label', 'Scannable QR code');
    await expect(canvas(page)).toHaveAttribute('role', 'img');
    await expect(canvas(page)).not.toHaveAttribute('title');
    await expect(canvas(page)).not.toHaveAttribute('data-marker');
    await expectMatchingModules(page);
    await canvas(page).click();

    await expect(control(page, 'QRCode events')).toHaveText('root');
  }
);

test(
  'QRCode preserves segmentation and changes correction without changing the requested payload',
  async ({ page }) => {
    const reference = page.locator('.reference-qrcode svg');
    const initial = await reference.locator('path').nth(1).getAttribute('d');
    await control(page, 'Boost QRCode').uncheck();
    await select(page, 'QRCode error level').selectOption('L');

    await expect(reference.locator('path').nth(1)).not.toHaveAttribute('d', initial!);
    await expectMatchingModules(page);
    await select(page, 'QRCode payload').selectOption('segments');
    const segmentedSize = await reference.getAttribute('viewBox');
    await expectMatchingModules(page);
    await select(page, 'QRCode payload').selectOption('joined');
    const joinedSize = await reference.getAttribute('viewBox');

    expect(Number(segmentedSize!.split(' ').at(-1)))
      .toBeLessThan(Number(joinedSize!.split(' ').at(-1)));
    await select(page, 'QRCode payload').selectOption('unicode');

    await expectMatchingModules(page);
  }
);

test(
  'QRCode renders quiet zones in modules and floors or clamps the requested margin',
  async ({ page }) => {
    await control(page, 'QRCode margin').fill('4.9');

    await expect(page.locator('.reference-qrcode svg')).toHaveAttribute('viewBox', '0 0 29 29');
    await expectMatchingModules(page);
    await control(page, 'QRCode margin').fill('-2');

    await expect(page.locator('.reference-qrcode svg')).toHaveAttribute('viewBox', '0 0 21 21');
    await expectMatchingModules(page);
  }
);

test(
  'QRCode switches to SVG without losing the root ref and forwards only plain style dimensions to the drawing',
  async ({ page }) => {
    await control(page, 'Styled QRCode').check();

    await expect(root(page)).toHaveCSS('width', '160px');
    await expect(root(page)).toHaveCSS('outline-offset', '6px');
    await expect(canvas(page)).not.toHaveAttribute('style');
    await control(page, 'Plain QRCode dimensions').check();

    await expect(root(page)).toHaveCSS('width', '320px');
    await expect(root(page)).toHaveCSS('height', '192px');
    await expect(root(page)).toHaveCSS('outline-offset', '8px');
    expect(await canvas(page).evaluate(node => [node.style.width, node.style.height]))
      .toEqual(['100%', '80%']);
    await select(page, 'QRCode renderer').selectOption('svg');

    await expect(canvas(page)).toHaveCount(0);
    await expect(root(page).locator('svg')).toHaveAttribute('viewBox', '0 0 21 21');
    await expect(root(page).locator('svg')).toHaveAttribute('aria-label', 'Scannable QR code');
    expect(await root(page).locator('svg').evaluate(node => [node.style.width, node.style.height]))
      .toEqual(['100%', '80%']);
    await expect(control(page, 'QRCode ref')).toHaveText('DIV');
  }
);

test(
  'QRCode retains the transparent border and removes padding and radius in borderless mode',
  async ({ page }) => {
    await expect(root(page)).toHaveCSS('padding', '12px');
    await expect(root(page)).toHaveCSS('border-radius', '8px');
    await control(page, 'Bordered QRCode').uncheck();

    await expect(root(page)).toHaveClass(/ant-qrcode-borderless/);
    await expect(root(page)).toHaveCSS('padding', '0px');
    await expect(root(page)).toHaveCSS('border-radius', '0px');
    await expect(root(page)).toHaveCSS('border-top-width', '1px');
    await expect(root(page)).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  }
);

test(
  'QRCode localizes status and refresh, inherits partial locale and preserves native action ordering',
  async ({ page }) => {
    await select(page, 'QRCode status').selectOption('expired');
    await expect(root(page).locator('.ant-qrcode-expired')).toHaveText('QR-код устарел');
    await root(page).getByRole('button', { name: 'Обновить', exact: true }).click();

    await expect(control(page, 'QRCode events')).toHaveText('refresh,root');
    await expect(root(page).locator('button')).toHaveAttribute('type', 'button');
    await control(page, 'English locale').check();

    await expect(root(page).locator('.ant-qrcode-expired')).toHaveText('QR code expired');
    await control(page, 'Partial QRCode locale').check();

    await expect(root(page).getByRole('button', { name: 'Reload code', exact: true })).toBeVisible();
    await expect(root(page).locator('.ant-qrcode-expired')).toHaveText('QR code expired');
    await select(page, 'QRCode status').selectOption('scanned');

    await expect(root(page).locator('.ant-qrcode-scanned')).toHaveText('Scanned');
  }
);

test(
  'QRCode loading and custom status leave the encoded image in place and never add a refresh fallback',
  async ({ page }) => {
    const before = await png(page);
    await select(page, 'QRCode status').selectOption('loading');

    await expect(root(page).locator('.ant-spin-spinning')).toBeVisible();
    expect(await png(page)).toBe(before);
    await control(page, 'Custom QRCode status').check();

    await expect(root(page).locator('.ant-spin')).toHaveCount(0);
    await expect(root(page).locator('.custom-qr-status')).toHaveAttribute('data-status', 'loading');
    await root(page).getByRole('button', { name: 'Custom QR refresh', exact: true }).focus();
    await page.keyboard.press('Enter');

    await expect(control(page, 'QRCode events')).toHaveText('refresh,root');
    await control(page, 'Empty QRCode status').check();

    await expect(root(page).locator('.ant-qrcode-cover')).toHaveText('');
    await expect(root(page).getByRole('button')).toHaveCount(0);
    await control(page, 'Empty QRCode status').uncheck();
    await control(page, 'Custom QRCode status').uncheck();
    await control(page, 'Refresh QRCode action').uncheck();
    await select(page, 'QRCode status').selectOption('expired');

    await expect(root(page).getByRole('button')).toHaveCount(0);
    await expect(root(page).locator('.ant-qrcode-expired')).toBeVisible();
  }
);

test(
  'QRCode merges semantic root and cover styles and replaces nested component config',
  async ({ page }) => {
    await select(page, 'QRCode status').selectOption('expired');

    await expect(root(page)).toHaveClass(/qrcode-context context-canvas local-canvas/);
    await expect(root(page)).toHaveCSS('outline-offset', '4px');
    await expect(root(page).locator('.ant-qrcode-cover')).toHaveClass(/context-cover local-cover/);
    await control(page, 'Styled QRCode').check();

    await expect(root(page)).toHaveCSS('outline-offset', '6px');
    await expect(root(page).locator('.ant-qrcode-cover')).toHaveCSS('outline-offset', '4px');
    await expect(root(page).locator('.ant-qrcode-cover')).toHaveCSS('color', 'rgb(0, 0, 255)');
    await control(page, 'Styled QRCode').uncheck();
    await control(page, 'Replace QRCode config').check();

    await expect(root(page)).toHaveClass(/nested-qrcode-context/);
    await expect(root(page)).not.toHaveClass(/(?:^| )qrcode-context(?: |$)/);
    await expect(root(page)).not.toHaveClass(/context-canvas/);
    await expect(root(page).locator('.ant-qrcode-cover')).not.toHaveClass(/context-cover/);
    await expect(root(page)).toHaveCSS('outline-offset', '0px');
  }
);

test(
  'QRCode inherits dark text and cover tokens and keeps an explicit module color above style.color',
  async ({ page }) => {
    const before = await png(page);
    await control(page, 'Dark QRCode').check();

    await expect(root(page)).toHaveCSS('color-scheme', 'dark');
    await expect.poll(() => png(page)).not.toBe(before);
    await expect(page.locator('.reference-qrcode svg path').nth(1))
      .toHaveAttribute('fill', 'rgba(255, 255, 255, 0.85)');
    await control(page, 'Styled QRCode').check();
    await control(page, 'Custom QRCode color').check();
    await control(page, 'Opaque QRCode background').check();

    await expect(page.locator('.reference-qrcode svg path').nth(1))
      .toHaveAttribute('fill', '#800080');
    await expectMatchingModules(page);
    await select(page, 'QRCode status').selectOption('expired');

    const cover = root(page).locator('.ant-qrcode-cover');
    await expect.poll(() => cover.evaluate(node => getComputedStyle(node).backgroundColor))
      .toMatch(/(?:color\(srgb 0\.07843|rgba\(20, 20, 20, 0\.96)/);
  }
);

test(
  'QRCode draws an icon only after successful loading and does not taint PNG export',
  async ({ page }) => {
    const before = await png(page);
    let release!: () => void;
    let seen!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    const requested = new Promise<void>(resolve => { seen = resolve; });
    await page.route('http://qrcode.test/icon.svg?key=1', async route => {
      seen();
      await pending;
      await route.fulfill({ contentType: 'image/svg+xml', headers: {
        'access-control-allow-origin': '*'
      }, body:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><rect width="20" height="10" fill="red"/></svg>'
      });
    });
    try {
      await select(page, 'QRCode icon').selectOption('remote');
      await requested;

      await expect(root(page).locator('img')).toHaveAttribute('crossorigin', 'anonymous');
      expect(await png(page)).toBe(before);
    } finally {
      release();
    }

    await expect.poll(() => centerPixel(page)).toEqual([255, 0, 0, 255]);
    expect(await png(page)).toMatch(/^data:image\/png;base64,/);
    expect(await png(page)).not.toBe(before);
  }
);

test(
  'QRCode SVG excavates immediately and preserves rectangular and zero-size icon rules',
  async ({ page }) => {
    await select(page, 'QRCode renderer').selectOption('svg');
    await control(page, 'Rectangular QRCode icon').check();
    const before = await root(page).locator('svg > path').nth(1).getAttribute('d');
    await select(page, 'QRCode icon').selectOption('data');
    const image = root(page).locator('svg > image');

    await expect(image).toHaveAttribute('width', '2.625');
    await expect(image).toHaveAttribute('height', '5.25');
    await expect(image).toHaveAttribute('preserveAspectRatio', 'none');
    await expect(root(page).locator('svg > path').nth(1)).not.toHaveAttribute('d', before!);
    await control(page, 'Zero QRCode icon size').check();

    await expect(image).toHaveAttribute('width', '2.1');
    await expect(image).toHaveAttribute('height', '2.1');
    await control(page, 'QRCode margin').fill('4');

    await expect(root(page).locator('svg')).toHaveAttribute('viewBox', '0 0 29 29');
    await expect(image).toHaveAttribute('width', '2.9');
  }
);

test('QRCode retains unexcavated canvas modules when an icon cannot decode', async ({ page }) => {
  const before = await png(page);
  await select(page, 'QRCode icon').selectOption('broken');
  await expect.poll(() => root(page).locator('img').evaluate(
    (image: HTMLImageElement) => image.complete && image.naturalWidth === 0
  )).toBe(true);

  expect(await png(page)).toBe(before);
});

test(
  'QRCode omits an empty value, restores an empty-segment code and clears its ref on unmount',
  async ({ page }) => {
    await select(page, 'QRCode payload').selectOption('empty');

    await expect(root(page)).toHaveCount(0);
    await expect(control(page, 'QRCode ref')).toHaveText('none');
    await select(page, 'QRCode payload').selectOption('empty-array');

    await expect(canvas(page)).toHaveAttribute('width', '160');
    await expectMatchingModules(page);
    await expect(control(page, 'QRCode ref')).toHaveText('DIV');
    await control(page, 'Mount QRCode').uncheck();

    await expect(root(page)).toHaveCount(0);
    await expect(control(page, 'QRCode ref')).toHaveText('none');
  }
);

test(
  'QRCode ignores a detached image load after unmount without repainting the old canvas',
  async ({ page }) => {
    await select(page, 'QRCode icon').selectOption('data');
    await expect.poll(() => centerPixel(page)).toEqual([255, 0, 0, 255]);
    const nodes = await page.evaluateHandle(() => ({
      canvas: document.querySelector<HTMLCanvasElement>('.fixture-qrcode canvas')!,
      image: document.querySelector<HTMLImageElement>('.fixture-qrcode img')!
    }));
    await control(page, 'Mount QRCode').uncheck();

    await expect(control(page, 'QRCode ref')).toHaveText('none');
    const width = await nodes.evaluate(({ canvas, image }) => {
      canvas.width = 1;
      image.dispatchEvent(new Event('load'));

      return new Promise<number>(resolve => requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve(canvas.width));
      }));
    });

    expect(width).toBe(1);
    await nodes.dispose();
  }
);

test(
  'QRCode keeps inherited RTL and disabled semantics for its refresh button',
  async ({ page }) => {
    await control(page, 'Right to left').check();
    await control(page, 'Disable all components').check();
    await select(page, 'QRCode status').selectOption('expired');

    await expect(root(page)).toHaveCSS('direction', 'rtl');
    await expect(root(page).getByRole('button', { name: 'Обновить', exact: true })).toBeDisabled();
    await expect(canvas(page)).toHaveAttribute('aria-label', 'Scannable QR code');
  }
);

test('QRCode retains its module drawing when Path2D is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'Path2D', { configurable: true, value: undefined });
  });
  await page.goto('/?fixture=qrcode');

  await expect(canvas(page)).toHaveAttribute('width', '160');
  await expectMatchingModules(page);
  await select(page, 'QRCode payload').selectOption('unicode');

  await expectMatchingModules(page);
});

test(
  'QRCode retains its native canvas shell when a 2D context is unavailable',
  async ({ page }) => {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
    await page.goto('/?fixture=qrcode');

    await expect(canvas(page)).toHaveAttribute('width', '160');
    await expect(root(page)).toHaveCSS('width', '160px');
    await control(page, 'QRCode size').fill('200');

    await expect(canvas(page)).toHaveAttribute('width', '200');
    await select(page, 'QRCode renderer').selectOption('svg');

    await expect(root(page).locator('svg > path')).toHaveCount(2);
    await expect(control(page, 'QRCode ref')).toHaveText('DIV');
  }
);

test.describe('QRCode DPR', () => {
  test.use({ deviceScaleFactor: 2 });

  test(
    'QRCode doubles bitmap dimensions while preserving requested CSS dimensions',
    async ({ page }) => {
      await expect(canvas(page)).toHaveAttribute('width', '320');
      await expect(canvas(page)).toHaveAttribute('height', '320');
      await expect(root(page)).toHaveCSS('width', '160px');
      await expect(root(page)).toHaveCSS('height', '160px');
      await expectMatchingModules(page);
    }
  );
});
