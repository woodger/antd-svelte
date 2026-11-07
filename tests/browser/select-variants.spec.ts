import { test, expect } from './test';
import reference from './fixtures/ant-design-select-variants-reference.json' with { type: 'json' };
import { snapshotSelectVariants } from './select-variants-metrics';

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=select-variants'); });

for (const sample of reference.cases) {
  test(`Select variant matches source root styles for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Select variant case', exact: true })
      .selectOption(sample.name);
    if (sample.focus) {
      await page.getByRole('combobox', { name: 'Variant select', exact: true }).focus();
    } else await page.mouse.move(1200, 700);

    await expect.poll(() => page.evaluate(snapshotSelectVariants)).toEqual(sample.expected);
  });
}

for (const mode of ['single', 'multiple']) {
  test(`Select ${mode} preserves its search, focus, selection and form values across variants`,
    async ({ page }) => {
      await page.getByRole('combobox', { name: 'Select variant case', exact: true })
        .selectOption(`${mode}-outlined`);
      await page.getByLabel('Search in variant select', { exact: true }).check();
      const input = page.getByRole('combobox', { name: 'Variant select', exact: true });
      const root = page.locator('#select-variant-control .ant-select');
      await input.click();
      await input.fill('gam');
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(0, 2, 'backward'));
      const previousInput = await input.elementHandle();
      const previousRoot = await root.elementHandle();

      for (const variant of ['filled', 'borderless', 'underlined', 'outlined']) {
        await page.getByRole('combobox', { name: 'Select variant override', exact: true })
          .evaluate((node, variant) => {
            (node as HTMLSelectElement).value = variant;
            node.dispatchEvent(new Event('change', { bubbles: true }));
          }, variant);

        await expect(root).toHaveClass(new RegExp(`ant-select-${variant}`));
        await expect(input).toHaveValue('gam');
        await expect(input).toBeFocused();
        await expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(await input.evaluate((node, old) => node === old, previousInput)).toBe(true);
        expect(await root.evaluate((node, old) => node === old, previousRoot)).toBe(true);
        expect(await input.evaluate(node => {
          const field = node as HTMLInputElement;
          return [field.selectionStart, field.selectionEnd, field.selectionDirection];
        })).toEqual([0, 2, 'backward']);
        expect(await page.getByRole('form', { name: 'Select variant form', exact: true })
          .evaluate(node => new FormData(node as HTMLFormElement).getAll('choice')))
          .toEqual(['alpha']);
        await expect(page.getByLabel('Select variant changes', { exact: true })).toHaveText('0');
      }

      await input.press('Enter');

      await expect(page.getByLabel('Select variant changes', { exact: true })).toHaveText('1');
      expect(await page.getByRole('form', { name: 'Select variant form', exact: true })
        .evaluate(node => new FormData(node as HTMLFormElement).getAll('choice')))
        .toEqual(mode === 'multiple' ? ['alpha', 'gamma'] : ['gamma']);
    });
}
