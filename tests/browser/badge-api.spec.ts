import type { Page } from '@playwright/test';
import { test, expect } from './test';
import { snapshotBadgeApi as snapshot } from './badge-api-metrics';
import reference from './fixtures/ant-design-badge-api-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=badge-api');
});

async function select(page: Page, name: string) {
  await page.getByLabel('Badge API reference', { exact: true }).selectOption(name);
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let index = 0; index < 5; index++) await new Promise(requestAnimationFrame);
  });
}

for (const sample of reference.cases) {
  test(`Badge configuration matches upstream for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    expect(await snapshot(page)).toEqual(sample.snapshot);

    if ('changed' in sample) {
      await page.getByRole('button', { name: 'Change badge API props', exact: true }).click();

      expect(await snapshot(page)).toEqual(sample.changed);

      await page.getByRole('button', { name: 'Change badge API props', exact: true }).click();

      expect(await snapshot(page)).toEqual(sample.restored);
    }
  });
}

test('Badge preserves custom control state and its root ref while configuration changes', async ({ page }) => {
  await page.getByLabel('Interactive API count', { exact: true }).check();
  await select(page, 'custom-component');
  const input = page.getByRole('textbox', { name: 'Badge API custom draft', exact: true });
  await input.fill('Owned draft');
  await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5));
  const previous = await input.elementHandle();
  const root = await page.locator('[data-api-root]').elementHandle();

  await page.getByRole('button', { name: 'Change badge API props', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(input).toHaveValue('Owned draft');
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, old) => ({
    same: node === old,
    selection: [(node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd]
  }), previous)).toEqual({ same: true, selection: [1, 5] });
  expect(await page.locator('[data-api-root]').evaluate((node, old) => node === old, root))
    .toBe(true);
  await expect(page.getByLabel('Badge API ref', { exact: true })).toHaveText('SPAN');
});

test('Badge clears its native ref on removal and forwards root events once', async ({ page }) => {
  await select(page, 'default');
  await page.getByRole('button', { name: 'Badge API owner', exact: true }).click();

  await expect(page.getByLabel('Badge API events', { exact: true })).toHaveText('native');
  await expect(page.locator('[data-api-root]')).toHaveAttribute('data-api-root', 'badge');
  await page.getByRole('button', { name: 'Badge API owner', exact: true }).press('Escape');
  await expect(page.getByLabel('Badge API events', { exact: true })).toHaveText('native,key:Escape');

  await page.getByRole('button', { name: 'Toggle API badge', exact: true }).click();

  await expect(page.locator('[data-api-root]')).toHaveCount(0);
  await expect(page.getByLabel('Badge API ref', { exact: true })).toHaveText('none');
});

test('Badge keeps native root styles independent of configured indicator styles', async ({ page }) => {
  await select(page, 'inherited-config');
  await page.getByLabel('Legacy API root style', { exact: true }).check();
  const root = page.locator('[data-api-root]');
  const indicator = root.locator('sup');
  const owner = page.getByRole('button', { name: 'Badge API owner', exact: true });
  await owner.focus();

  await expect(root).toHaveCSS('padding', '4px 4px 4px 8px');
  await expect(root).toHaveCSS('color', 'rgb(12, 34, 56)');
  await expect(indicator).toHaveCSS('padding', '0px');
  await expect(indicator).toHaveCSS('color', 'rgb(70, 80, 90)');

  await page.getByRole('button', { name: 'Change badge API props', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(root).toHaveCSS('padding', '0px 0px 0px 8px');
  await expect(indicator).toHaveCSS('padding', '0px');
  await expect(owner).toBeFocused();
});

test('Badge forwards native span direction, language and focus attributes', async ({ page }) => {
  await select(page, 'default');
  await page.getByLabel('Native span attributes', { exact: true }).check();
  const root = page.locator('[data-api-root]');

  await expect(root).toHaveAttribute('dir', 'rtl');
  await expect(root).toHaveAttribute('lang', 'ru');
  await expect(root).toHaveAttribute('tabindex', '0');
  await expect(root).not.toHaveClass(/ant-badge-rtl/);
  await root.focus();
  await expect(root).toBeFocused();
});
