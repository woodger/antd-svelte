import { test, expect } from './test';
import reference from './fixtures/ant-design-config-variants-reference.json' with { type: 'json' };
import { snapshotConfigVariants } from './config-variants-metrics';

for (const sample of reference.cases) {
  test(`ConfigProvider and Form variants match all source consumers for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=config-variants');
      await page.getByRole('combobox', { name: 'Config variant case', exact: true })
        .selectOption(sample.name);
      await page.mouse.move(1300, 1750);

      await expect.poll(() => page.evaluate(snapshotConfigVariants, reference.kinds))
        .toEqual(sample.expected);
      await expect(page.getByRole('form', { name: 'Variant controls form', exact: true }))
        .toHaveCount(1);
      await expect(page.locator('#variant-context-only')).toHaveCount(0);
    });
}

for (const preset of ['global-filled', 'form-over-input-fallback']) {
  test(`ColorPicker keeps its source borderless format selector inside ${preset}`,
    async ({ page }) => {
      await page.goto('/?fixture=config-variants');
      await page.getByRole('combobox', { name: 'Config variant case', exact: true })
        .selectOption(preset);
      await page.getByRole('button', { name: 'Variant color', exact: true }).click();

      await expect(page.locator('.ant-color-picker-format-select .ant-select'))
        .toHaveClass(/ant-select-borderless/);
      await page.getByRole('combobox', { name: 'Color format', exact: true }).click();
      await page.getByRole('option', { name: 'RGB', exact: true }).click();

      await expect(page.getByLabel('Color r', { exact: true })).toHaveValue('22');
      await expect(page.getByLabel('Variant changes', { exact: true })).toHaveText('0');
    });
}

for (const field of ['input', 'text-area', 'multiple-select']) {
  test(`Global and Form variants preserve ${field} DOM, draft, focus and selection`,
    async ({ page }) => {
      await page.goto('/?fixture=config-variants');
      await page.getByRole('combobox', { name: 'Config variant case', exact: true })
        .selectOption('default');
      const input = page.locator(`[data-variant-kind="${field}"]`).locator('input, textarea').first();
      const root = field === 'multiple-select'
        ? page.locator('[data-variant-kind="multiple-select"] .ant-select') : input;
      const prefix = field === 'multiple-select' ? 'ant-select' : 'ant-input';
      const original = await input.elementHandle();
      const value = field === 'multiple-select' ? 'gam' : 'Retained variant draft';
      await input.fill(value);
      await input.evaluate(node => {
        (node as HTMLInputElement).setSelectionRange(1, 3, 'backward');
      });
      const before = await page.getByLabel('Variant changes', { exact: true }).textContent();
      const form = page.getByRole('form', { name: 'Variant controls form', exact: true });
      const previousFormData = await form.evaluate(node => [...new FormData(node as HTMLFormElement)]);

      for (const scope of ['Global', 'Form']) {
        for (const variant of ['filled', 'borderless', 'underlined', 'outlined', 'inherit']) {
          await page.getByRole('combobox', { name: `${scope} variant override`, exact: true })
            .evaluate((node, variant) => {
              (node as HTMLSelectElement).value = variant;
              node.dispatchEvent(new Event('change', { bubbles: true }));
            }, variant);

          await expect(root).toHaveClass(new RegExp(
            `${prefix}-${variant === 'inherit' ? 'outlined' : variant}`
          ));
          await expect(input).toHaveValue(value);
          await expect(input).toBeFocused();
          expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
          expect(await input.evaluate(node => {
            const control = node as HTMLInputElement;
            return [control.selectionStart, control.selectionEnd, control.selectionDirection];
          })).toEqual([1, 3, 'backward']);
          expect(await form.evaluate(node => [...new FormData(node as HTMLFormElement)]))
            .toEqual(previousFormData);
          await expect(page.getByLabel('Variant changes', { exact: true })).toHaveText(before!);
          await expect(page.getByRole('textbox', { name: 'Outside variant sibling', exact: true }))
            .toHaveClass(/ant-input-outlined/);
        }
      }

      if (field === 'multiple-select') {
        await input.press('Enter');

        expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('choices')))
          .toEqual(['alpha', 'gamma']);
      }
    });
}
