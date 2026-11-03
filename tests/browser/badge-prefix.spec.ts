import type { Page } from '@playwright/test';
import { test, expect } from './test';
import { snapshotBadgeApi as snapshot } from './badge-api-metrics';
import reference from './fixtures/ant-design-badge-prefix-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=badge-prefix');
});

async function select(page: Page, name: string) {
  await page.getByLabel('Badge prefix reference', { exact: true }).selectOption(name);
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let index = 0; index < 5; index++) await new Promise(requestAnimationFrame);
  });
}

for (const sample of reference.cases) {
  test(`Badge prefixes match upstream for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    expect(await snapshot(page, true, true)).toEqual(sample.snapshot);

    if ('changed' in sample) {
      await page.getByRole('button', { name: 'Change badge value props', exact: true }).click();

      expect(await snapshot(page, true, true)).toEqual(sample.changed);

      await page.getByRole('button', { name: 'Change badge value props', exact: true }).click();

      expect(await snapshot(page, true, true)).toEqual(sample.restored);
    }
  });
}

test('Badge changes its local prefix without replacing the owner, root or digits', async ({ page }) => {
  await select(page, 'reactive-root-prefix');
  const root = await page.locator('[data-api-root]').elementHandle();
  const digit = await page.locator('bdi > span').first().elementHandle();
  const owner = page.getByRole('button', { name: 'Badge API owner', exact: true });
  await owner.focus();

  await page.getByRole('button', { name: 'Change badge value props', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  expect(await page.locator('[data-api-root]').evaluate((node, old) => node === old, root))
    .toBe(true);
  expect(await page.locator('bdi > span').first().evaluate((node, old) => node === old, digit))
    .toBe(true);
  await expect(owner).toBeFocused();
  await expect(page.locator('head [data-ant-svelte-theme^="badge-prefix:"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Toggle value badge', exact: true }).click();

  await expect(page.locator('head [data-ant-svelte-theme^="badge-prefix:"]')).toHaveCount(0);
  await expect(page.getByLabel('Badge API ref', { exact: true })).toHaveText('none');
});

test('Badge retains caller controls while both prefix props change', async ({ page }) => {
  await select(page, 'reactive-custom-count');
  await page.getByLabel('Interactive prefix count', { exact: true }).check();
  const input = page.getByRole('textbox', { name: 'Badge API custom draft', exact: true });
  await input.fill('Owned draft');
  const previous = await input.elementHandle();

  await page.getByRole('button', { name: 'Change badge value props', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(input).toHaveValue('Owned draft');
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, old) => node === old, previous)).toBe(true);
});
