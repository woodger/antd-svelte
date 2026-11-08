import { test, expect } from './test';
import reference from './fixtures/ant-design-modal-content-reference.json' with { type: 'json' };

for (const entry of reference.cases) {
  test(`Modal preserves source header and ARIA attributes for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=modal-content');
    await page.getByRole('combobox', { name: 'Modal title sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Open content modal', exact: true }).click();
    const expected: {
      headers: number;
      title: string | null;
      labelledBy: boolean;
      externalLabelledBy: boolean;
      ariaLabel: string | null;
    } = structuredClone(entry.result);
    if (entry.sample.id === 'zero') {
      expected.headers = 1;
      expected.title = '0';
      expected.labelledBy = true;
    }
    if ('label' in entry.sample) {
      expected.ariaLabel = entry.sample.label!;
      expected.labelledBy = false;
    }
    if ('labelledBy' in entry.sample) expected.externalLabelledBy = true;

    const snapshot = () => page.locator('dialog').evaluate(dialog => ({
      headers: dialog.querySelectorAll('.ant-modal-header').length,
      title: dialog.querySelector('.ant-modal-title')?.textContent ?? null,
      labelledBy: dialog.getAttribute('aria-labelledby') !== null,
      externalLabelledBy: dialog.getAttribute('aria-labelledby') === 'external-title',
      ariaLabel: dialog.getAttribute('aria-label')
    }));
    await expect.poll(snapshot).toEqual(expected);
    await expect(page.locator('dialog')).toHaveJSProperty('open', true);
    if ('label' in entry.sample) {
      await expect(page.getByRole('dialog', { name: entry.sample.label, exact: true })).toBeVisible();
    }
    if ('labelledBy' in entry.sample) {
      await expect(page.getByRole('dialog', { name: 'External modal name', exact: true }))
        .toBeVisible();
    }
  });
}

test('Modal replaces title content without resetting the native dialog, draft, focus or selection',
  async ({ page }) => {
    await page.goto('/?fixture=modal-content');
    await page.getByRole('button', { name: 'Open content modal', exact: true }).click();
    const input = page.getByRole('textbox', { name: 'Modal draft', exact: true });
    await input.fill('kept draft');
    await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });
    const original = await input.elementHandle();
    for (const value of ['node', 'missing', 'zero', 'string']) {
      await page.locator('#modal-title-sample').evaluate((node: HTMLSelectElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);

      expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
      await expect(input).toHaveValue('kept draft');
      await expect(input).toBeFocused();
      expect(await input.evaluate((node: HTMLInputElement) => [
        node.selectionStart, node.selectionEnd
      ])).toEqual([1, 5]);
      expect(await page.locator('dialog').evaluate(node => node.matches(':modal'))).toBe(true);
    }
    await input.press('Escape');
    await expect(page.locator('dialog')).toHaveJSProperty('open', false);
    await expect(page.getByRole('button', { name: 'Open content modal', exact: true })).toBeFocused();
  });
