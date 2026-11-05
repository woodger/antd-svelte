import { test, expect } from './test';
import reference from './fixtures/ant-design-empty-reference.json' with { type: 'json' };
import { snapshotEmptySource } from './empty-source-metrics';

const root = '[data-empty-source-frame] > [data-ant-empty]';
test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=empty-source');

  await expect(page.getByRole('heading', { name: 'Source Empty API', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
});

for (const sample of reference.cases) {
  test(`Empty matches the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Empty source case', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotEmptySource,
      'prefixCls' in sample.props ? sample.props.prefixCls || 'ant-empty' : 'ant-empty'))
      .toEqual(sample.snapshot);
  });
}

test('Empty applies live semantic config, theme and prefix while retaining native actions and refs', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Empty source case', exact: true }).selectOption('actions');
  const draft = page.getByRole('textbox', { name: 'Empty source draft', exact: true });
  const action = page.getByRole('button', { name: 'Empty source action 0', exact: true });
  const original = await page.locator(root).elementHandle();
  const originalDraft = await draft.elementHandle();
  await action.click();
  await draft.fill('Retained draft');
  await draft.focus();

  for (const name of ['Configure Empty source', 'Change Empty source prefix',
    'Theme Empty source', 'RTL Empty source']) {
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }

  await expect(page.locator(root)).toHaveClass(/live-empty-rtl/);
  await expect(page.locator(root)).toHaveCSS('padding-top', '7px');
  await expect(page.locator(root).locator('[data-ant-empty-part="image"]'))
    .toHaveCSS('height', '37px');
  await expect(page.locator(root).locator('[data-ant-empty-part="description"]'))
    .toHaveCSS('color', 'rgb(51, 85, 119)');
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Retained draft');
  await expect(page.getByRole('button', { name: 'Empty source action 1', exact: true })).toBeVisible();
  expect(await draft.evaluate((node, previous) => node === previous, originalDraft)).toBe(true);
  expect(await page.locator(root).evaluate((node, previous) => node === previous, original))
    .toBe(true);
  await expect(page.getByLabel('Empty source native ref', { exact: true })).toHaveText('true');
  await expect(page.getByLabel('Empty source object ref', { exact: true })).toHaveText('true');
});

test('Empty releases refs and prefix styles on unmount and recreates the native draft on remount', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Empty source case', exact: true }).selectOption('actions');
  await page.getByRole('button', { name: 'Change Empty source prefix', exact: true }).click();
  const style = page.locator('style[data-ant-svelte-theme="empty-prefix:live-empty"]');
  await page.getByRole('button', { name: 'Empty source action 0', exact: true }).click();
  await page.getByRole('textbox', { name: 'Empty source draft', exact: true }).fill('Old draft');

  await expect(style).toHaveCount(1);
  await page.getByRole('button', { name: 'Toggle Empty source mount', exact: true }).click();

  await expect(page.locator(root)).toHaveCount(0);
  await expect(style).toHaveCount(0);
  await expect(page.getByLabel('Empty source native ref', { exact: true })).toHaveText('false');
  await expect(page.getByLabel('Empty source object ref', { exact: true })).toHaveText('false');
  await page.getByRole('button', { name: 'Toggle Empty source mount', exact: true }).click();

  // Счётчик принадлежит fixture; native draft принадлежит заново созданным children Empty.
  await expect(page.getByRole('button', { name: 'Empty source action 1', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Empty source draft', exact: true }))
    .toHaveValue('Fresh draft');
  await expect(style).toHaveCount(1);
  await expect(page.getByLabel('Empty source object ref', { exact: true })).toHaveText('true');
});

test('Empty keeps custom image snippets decorative and restores focus after removing actions', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Empty source case', exact: true })
    .selectOption('custom-image');

  await expect(page.locator(root).locator('[data-ant-empty-part="image"]'))
    .toHaveAttribute('inert', '');
  await expect(page.getByRole('link', { name: 'Decorative source image link', exact: true }))
    .toHaveCount(0);
  await page.getByRole('button', { name: 'Before Empty source', exact: true }).focus();
  await page.keyboard.press('Tab');

  await expect(page.getByRole('button', { name: 'After Empty source', exact: true })).toBeFocused();
  await page.getByRole('combobox', { name: 'Empty source case', exact: true }).selectOption('actions');
  await page.getByRole('button', { name: 'Empty source action 0', exact: true }).focus();
  await page.getByRole('button', { name: 'Toggle Empty source mount', exact: true })
    .dispatchEvent('click');

  await expect(page.getByRole('button', { name: 'After Empty source', exact: true })).toBeFocused();
});

test('Empty exposes URL metadata while keeping its image outside native focus and accessibility', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Empty source case', exact: true }).selectOption('url');
  const image = page.locator(root).locator('img');

  await expect(image).toHaveAttribute('alt', 'Custom URL');
  await expect(image).toHaveAttribute('draggable', 'false');
  await expect(page.getByRole('img')).toHaveCount(0);
  await expect.poll(() => image.evaluate(node =>
    node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0
  )).toBe(true);
});
