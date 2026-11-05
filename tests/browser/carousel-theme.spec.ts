import { test, expect } from './test';
import reference from './fixtures/ant-design-carousel-theme-reference.json' with { type: 'json' };
import { snapshotCarouselTheme } from './carousel-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Carousel tokens match pinned geometry for ${sample.name}`, async ({ page }) => {
    await page.goto('/?fixture=carousel-theme');
    await page.getByLabel('Carousel token preset', { exact: true }).selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotCarouselTheme)).toEqual(sample.metrics);
  });
}

test('Carousel applies the reported tokens without changing its sibling', async ({ page }) => {
  await page.goto('/?fixture=carousel-theme');
  const root = page.locator('[data-carousel-theme="bottom"]');

  await expect(root.locator('.slick-dots li:not(.slick-active)').first()).toHaveCSS('width', '32px');
  await expect(root.locator('.slick-dots li.slick-active')).toHaveCSS('width', '48px');
  await expect(root.locator('.slick-prev')).toHaveCSS('width', '28px');
  await expect(page.locator('[data-carousel-theme="outside"] .slick-prev'))
    .toHaveCSS('width', '16px');
});

test('Carousel theme updates retain slides, drafts, focus and isolated provider scopes', async ({ page }) => {
  await page.goto('/?fixture=carousel-theme');
  const host = page.locator('[data-carousel-theme="bottom"]');
  const root = host.locator('.ant-carousel');
  const draft = host.locator('.slick-active input').first();
  await draft.fill('Kept Carousel draft');
  await draft.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 7));
  const original = await draft.elementHandle();
  const active = await host.locator('.slick-current').getAttribute('data-index');
  await page.getByRole('button', { name: 'Update Carousel dot width', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(host.locator('.slick-dots li:not(.slick-active)').first()).toHaveCSS('width', '19px');
  for (const [id, width] of [['nested', 9], ['reset', 11], ['sibling', 10], ['outside', 16]]) {
    await expect(page.locator(`[data-carousel-theme="${id}"] .slick-dots li:not(.slick-active)`).first())
      .toHaveCSS('width', `${width}px`);
  }
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Kept Carousel draft');
  expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
  expect(await draft.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
    .toEqual([2, 7]);
  await expect(host.locator('.slick-current')).toHaveAttribute('data-index', active!);
  await page.getByLabel('Inherit child Carousel tokens', { exact: true }).uncheck();

  await expect(page.locator('[data-carousel-theme="nested"] .slick-dots li.slick-active'))
    .toHaveCSS('width', '24px');
  await page.getByLabel('Apply source Carousel tokens', { exact: true }).dispatchEvent('click');

  await expect(host.locator('.slick-dots li:not(.slick-active)').first()).toHaveCSS('width', '16px');
  await expect(root).not.toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);
  expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
  await host.locator('.slick-next').click();
  await expect(host.locator('.slick-current')).not.toHaveAttribute('data-index', active!);
  await host.locator('.slick-current').focus();
  await host.locator('.slick-current').press('ArrowRight');
  await expect(host.locator('.slick-current')).toHaveAttribute('data-index', '2');
  await page.getByLabel('Mount themed Carousels', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
  await expect(page.locator('[data-carousel-theme="outside"] .slick-prev')).toHaveCSS('width', '16px');
});
