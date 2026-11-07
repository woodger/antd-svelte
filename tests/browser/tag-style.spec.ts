import { test, expect } from './test';
import reference from './fixtures/ant-design-tag-style-reference.json' with { type: 'json' };
import { snapshotTagStyle } from './tag-style-metrics';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tag-style');
});

for (const sample of reference.cases) {
  test(`Tag matches source styling for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Tag style reference' }).selectOption(sample.name);
    const host = page.locator('#tag-style-surface');
    await expect(host).toBeVisible();

    expect(await host.evaluate(snapshotTagStyle)).toEqual(sample.snapshot);
    if ('patch' in sample) {
      await page.getByRole('button', { name: 'Change Tag styles', exact: true }).click();

      expect(await host.evaluate(snapshotTagStyle)).toEqual(sample.changed);

      await page.getByRole('button', { name: 'Change Tag styles', exact: true }).click();

      expect(await host.evaluate(snapshotTagStyle)).toEqual(sample.restored);
    }
  });
}

test('Tag updates semantic styles without replacing its close control or losing focus', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Tag style reference' }).selectOption('current-functions');
  const close = page.locator('#tag-style-surface .ant-tag-close-icon');
  const original = await close.elementHandle();
  await close.focus();
  await page.getByRole('button', { name: 'Change Tag styles', exact: true })
    .dispatchEvent('click');

  await expect(close).toBeDisabled();
  expect(await close.evaluate((node, original) => node === original, original)).toBe(true);

  await page.getByRole('button', { name: 'Change Tag styles', exact: true })
    .dispatchEvent('click');
  await close.focus();

  await expect(close).toBeFocused();
  expect(await close.evaluate((node, original) => node === original, original)).toBe(true);

  await page.getByRole('textbox', { name: 'Tag style outside input' }).fill('Outside state');
  await page.getByRole('button', { name: 'Toggle styled Tag', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle styled Tag', exact: true }).click();

  await expect(page.getByRole('textbox', { name: 'Tag style outside input' }))
    .toHaveValue('Outside state');
});
