import { test, expect } from './test';
import reference from './fixtures/ant-design-table-panels-reference.json' with { type: 'json' };
import { snapshotTablePanels } from './table-panels-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=table-panels'); });

for (const sample of reference.cases) {
  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Table title/footer matches source ${mode} panels for ${sample.name}`, async ({ page }) => {
      await page.getByLabel('Table panels preset', { exact: true }).selectOption(sample.name);
      await page.getByLabel('Table panels mode', { exact: true }).selectOption(mode);
      await page.mouse.move(1300, 1100);

      await expect.poll(() => page.evaluate(snapshotTablePanels)).toEqual(expected);
    });
  }
}

test('Table panels follow paging, sorting and filters without replacing an edited footer input',
  async ({ page }) => {
    await page.getByLabel('Table panels mode', { exact: true }).selectOption('stateful');
    const root = page.locator('#table-panels-control');
    const input = root.getByRole('textbox', { name: 'Footer draft', exact: true });
    await input.fill('Retained footer');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const original = await input.elementHandle();
    await expect(root.locator('[data-title-data]')).toHaveText('[1,2]');

    await root.getByRole('button', { name: 'Page 2', exact: true }).dispatchEvent('click');

    await expect(root.locator('[data-title-data]')).toHaveText('[3,4]');
    await expect(root.locator('[data-footer-data]')).toHaveText('[3,4]');
    await expect(input).toHaveValue('Retained footer');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    await expect(root.getByLabel('Table panels events', { exact: true }))
      .toHaveText('["paginate"]');

    await root.locator('.sort-button').dispatchEvent('click');

    await expect(root.locator('[data-title-data]')).toHaveText('[2,5]');
    await expect(root.locator('[data-footer-data]')).toHaveText('[2,5]');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Retained footer');

    await root.locator('.ant-table-filter-trigger').click();
    const dialog = root.getByRole('dialog');
    await dialog.getByRole('checkbox', { name: 'Ten', exact: true }).check();
    await page.keyboard.press('Enter');

    await expect(root.locator('[data-title-data]')).toHaveText('[1,4]');
    await expect(root.locator('[data-footer-data]')).toHaveText('[1,4]');
    await expect(root.getByLabel('Table panels events', { exact: true }))
      .toHaveText('["paginate","sort","filter"]');
    await expect(input).toHaveValue('Retained footer');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  });

test('Table panel token updates preserve caption, editor focus, selection and form data',
  async ({ page }) => {
    await page.getByLabel('Table panels mode', { exact: true }).selectOption('stateful');
    const root = page.locator('#table-panels-control');
    const input = root.getByRole('textbox', { name: 'Footer draft', exact: true });
    await input.fill('Themed footer');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 6, 'backward'));
    const original = await input.elementHandle();
    const originalPanel = await root.locator('.ant-table-footer').elementHandle();

    await page.getByRole('button', { name: 'Update table panels theme', exact: true })
      .dispatchEvent('click');

    await expect(root.locator('.ant-table-footer'))
      .toHaveCSS('background-color', 'rgb(230, 255, 251)');
    await expect(root.locator('.ant-table-footer')).toHaveCSS('color', 'rgb(207, 19, 34)');
    await expect(root.locator('.ant-table-footer')).toHaveCSS('font-size', '19px');
    await expect(root.locator('.ant-table-footer')).toHaveCSS('padding-top', '10px');
    await expect(root.getByRole('table', { name: 'Panel people', exact: true })).toBeVisible();
    await expect(input).toHaveValue('Themed footer');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await root.locator('.ant-table-footer').evaluate((node, old) => node === old,
      originalPanel)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([2, 6, 'backward']);
    expect(await root.getByRole('form').evaluate(node => Object.fromEntries(
      new FormData(node as HTMLFormElement)))).toEqual({
      titleDraft: 'Title draft', footerDraft: 'Themed footer'
    });
    await expect(root.getByLabel('Table panels events', { exact: true })).toHaveText('[]');
  });

test('Table title can unmount without replacing the footer or changing its draft',
  async ({ page }) => {
    await page.getByLabel('Table panels mode', { exact: true }).selectOption('stateful');
    const root = page.locator('#table-panels-control');
    const input = root.getByRole('textbox', { name: 'Footer draft', exact: true });
    await input.fill('Independent footer');
    const original = await input.elementHandle();

    await page.getByLabel('Show table title', { exact: true }).dispatchEvent('click');

    await expect(root.locator('.ant-table-title')).toHaveCount(0);
    await expect(input).toHaveValue('Independent footer');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(root.locator('caption')).toHaveText('Panel people');

    await page.getByLabel('Show table title', { exact: true }).dispatchEvent('click');

    await expect(root.locator('[data-title-data]')).toHaveText('[1,2]');
    await expect(input).toBeFocused();
    await expect(root.getByLabel('Table panels events', { exact: true })).toHaveText('[]');
  });

test('Table panels receive the supplied server page without applying pagination again',
  async ({ page }) => {
    await page.getByLabel('Table panels mode', { exact: true }).selectOption('page2');
    const root = page.locator('#table-panels-control');

    await page.getByLabel('Server table panels', { exact: true }).check();

    await expect(root.locator('[data-title-data]')).toHaveText('[3,4]');
    await expect(root.locator('[data-footer-data]')).toHaveText('[3,4]');
    await expect(root.locator('tbody tr.ant-table-row')).toHaveCount(2);
    await expect(root.getByLabel('Table panels events', { exact: true })).toHaveText('[]');
  });

test('Table panel loading and legacy theme updates preserve inputs and release them on unmount',
  async ({ page }) => {
    await page.getByLabel('Table panels mode', { exact: true }).selectOption('stateful');
    const root = page.locator('#table-panels-control');
    const input = root.getByRole('textbox', { name: 'Title draft', exact: true });
    await input.fill('Retained title');
    const original = await input.elementHandle();

    await page.getByLabel('Load table panels', { exact: true }).dispatchEvent('click');
    await page.getByLabel('Apply source panel theme', { exact: true }).dispatchEvent('click');

    await expect(root.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    await expect(root.locator('.ant-table-footer')).toHaveCSS('font-size', '14px');
    await expect(input).toHaveValue('Retained title');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(root.getByLabel('Table panels events', { exact: true })).toHaveText('[]');

    await page.getByLabel('Mount table panels', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCount(0);
    expect(await original?.evaluate(node => node.isConnected)).toBe(false);
  });
