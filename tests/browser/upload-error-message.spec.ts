import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-error-message-reference.json' with { type: 'json' };

for (const [index, entry] of reference.cases.entries()) {
  test(`Upload error Tooltip matches Source message priority for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=upload-error-message');
      await page.getByRole('combobox', { name: 'Upload error sample', exact: true })
        .selectOption(String(index));
      await page.locator('.ant-upload-list-item').hover();

      await expect(page.getByRole('tooltip')).toHaveText(entry.message ?? '');
    });
}

test('Upload error Tooltip updates the open message while retaining its row and input',
  async ({ page }) => {
    await page.goto('/?fixture=upload-error-message');
    await page.getByRole('checkbox', { name: 'Live Upload error message', exact: true }).check();
    const row = page.locator('.ant-upload-list-item');
    const input = page.locator('input[type=file]');
    const oldRow = await row.elementHandle();
    const oldInput = await input.elementHandle();
    await row.hover();
    await expect(page.getByRole('tooltip')).toBeVisible();

    for (const [index, entry] of reference.transitions.entries()) {
      await page.getByRole('combobox', { name: 'Live Upload error step', exact: true })
        .evaluate((node: HTMLSelectElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, String(index));

      await expect(page.getByRole('tooltip')).toHaveText(entry.message ?? '');
      expect(await row.evaluate((node, old) => node === old, oldRow)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
    }
  });
