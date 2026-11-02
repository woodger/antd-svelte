import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-destroy-reference.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=tabs-destroy');
});

for (const sample of reference.cases) {
  test(`legacy destruction preserves source aliases and native precedence for ${sample.name}`,
    async ({ page }) => {
      await page.getByLabel('Tabs destruction reference', { exact: true }).selectOption(sample.name);
      const root = page.locator('#tabs-destroy-main');
      const alpha = page.getByRole('textbox', { name: 'Alpha draft', exact: true });
      await alpha.fill('Retained legacy draft');
      const original = await alpha.elementHandle();
      await root.getByRole('button', { name: 'Increment Alpha', exact: true }).click();
      await root.getByRole('tab', { name: 'Beta', exact: true }).click();
      const retained = 'nativeRetained' in sample ? sample.nativeRetained : sample.sourceRetained;

      await expect(root.locator('input[name="Alpha"]')).toHaveCount(retained ? 1 : 0);
      expect(await page.locator('#tabs-destroy-form').evaluate(element =>
        new FormData(element as HTMLFormElement).has('Alpha'))).toBe(retained);
      await root.getByRole('tab', { name: 'Alpha', exact: true }).click();

      await expect(alpha).toHaveValue(retained ? 'Retained legacy draft' : 'Alpha initial');
      await expect(root.getByLabel('Alpha count', { exact: true })).toHaveText(retained ? '1' : '0');
      expect(await alpha.evaluate((element, previous) => element === previous, original)).toBe(retained);
    });
}

test('turning off a legacy flag keeps a destroyed pane lazy and repairs owned focus', async ({ page }) => {
  const alpha = page.getByRole('textbox', { name: 'Alpha draft', exact: true });
  await alpha.fill('Removed legacy draft');
  await page.getByRole('button', { name: 'Hide legacy Alpha', exact: true }).evaluate(element => {
    if (!(element instanceof HTMLButtonElement)) throw new Error('Expected a native button');
    element.click();
  });

  await expect(page.locator('input[name="Alpha"]')).toHaveCount(0);
  await expect(page.locator('#tabs-destroy-main').getByRole('tab', { name: 'Beta', exact: true }))
    .toBeFocused();
  await page.getByLabel('Use legacy destruction flags', { exact: true }).uncheck();

  await expect(page.locator('input[name="Alpha"]')).toHaveCount(0);
  await expect(page.getByLabel('Tabs destruction changes', { exact: true })).toHaveText('[]');
  await page.locator('#tabs-destroy-main').getByRole('tab', { name: 'Alpha', exact: true }).click();

  await expect(alpha).toHaveValue('Alpha initial');
  await expect(page.getByLabel('Tabs destruction lifecycle', { exact: true }))
    .toHaveText('["mount:Alpha","destroy:Alpha","mount:Beta","mount:Alpha"]');
});
