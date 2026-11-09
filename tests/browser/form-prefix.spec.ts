import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-form-prefix-reference.json' with { type: 'json' };
import { snapshotFormPrefix } from './form-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Form prefixes and media match Source layout for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-prefix');
    await page.getByRole('combobox', { name: 'Form prefix sample', exact: true })
      .selectOption(entry.sample.id);

    for (const result of entry.widths) {
      await page.setViewportSize({ width: result.width, height: 1100 });

      await expect.poll(() => page.evaluate(snapshotFormPrefix)).toEqual(result.expectedNative);
    }
  });
}

async function setPrefix(page: Page, name: string, value: string) {
  await page.getByRole('textbox', { name, exact: true }).evaluate(
    (node: HTMLInputElement, value) => {
      node.value = value;
      node.dispatchEvent(new Event('input', { bubbles: true }));
    }, value
  );
}

test('Form prefix updates preserve field registration, nodes, value, selection and submit', async ({
  page
}) => {
  await page.goto('/?fixture=form-prefix');
  await page.getByRole('checkbox', { name: 'Live Form prefix', exact: true }).check();
  const scope = page.locator('[data-form-prefix-scope="normal"]');
  const input = scope.getByRole('textbox', { name: 'normal draft', exact: true });
  const form = scope.locator('form');
  const oldInput = await input.elementHandle();
  const oldForm = await form.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, 'Live Form prefix value', step.prefix);

    await expect.poll(() => page.evaluate(snapshotFormPrefix)).toEqual(step.result);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    expect(await form.evaluate((node, old) => node === old, oldForm)).toBe(step.sameForm);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await form.evaluate(node => [...new FormData(node as HTMLFormElement).entries()]))
      .toEqual(step.formValues);
    await expect(scope.getByLabel('normal form events')).toHaveText('kept draft');
  }
  await setPrefix(page, 'Local Form prefix value', 'editor');
  await setPrefix(page, 'Local FormItem prefix value', 'field');

  await expect(form).toHaveClass(/editor/);
  await expect(scope.locator('.field-item')).toHaveCount(2);
  await expect(input).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(scope.getByLabel('normal form submitted')).toHaveText('kept draft');
  await input.fill('');
  await scope.getByRole('button', { name: 'normal validate form', exact: true }).click();

  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(scope.getByRole('alert')).toHaveText('Required');
  await scope.getByRole('button', { name: 'normal reset form', exact: true }).click();

  await expect(input).toHaveValue('Draft');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(scope.getByRole('alert')).toHaveCount(0);
});

test('FormErrorList retains Item/noStyle fallback and the existing List prefix priority', async ({
  page
}) => {
  await page.goto('/?fixture=form-prefix');

  for (const [owner, prefix, text] of [
    ['item', 'owner-field', 'Item error'],
    ['no-style', 'owner-field', 'Nested error'],
    ['list', 'list-feedback', 'List error'],
    ['canonical-media', 'ant-form', 'Media error']
  ]) {
    const errors = page.locator(`[data-prefix-errors="${owner}"] [data-ant-form-error-list]`);

    await expect(errors).toHaveClass(new RegExp(`${prefix}-item-explain`));
    await expect(errors).toHaveText(text);
    await expect(errors.locator('[data-ant-form-error-message]'))
      .toHaveCSS('color', 'rgb(255, 77, 79)');
  }
});
