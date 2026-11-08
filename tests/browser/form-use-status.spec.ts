import { test, expect } from './test';
import reference from './fixtures/ant-design-form-use-status-reference.json' with { type: 'json' };

function statusReaders() {
  return Object.fromEntries([...document.querySelectorAll('[data-form-status-read]')]
    .map(node => [node.getAttribute('data-form-status-read'), JSON.parse(node.textContent!)]));
}

for (const { sample, metrics } of reference.cases) {
  test(`Form useFormItemStatus follows source context and metadata for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-use-status');
    await page.getByRole('combobox', { name: 'Form use status sample', exact: true })
      .selectOption(sample.id);
    await expect.poll(() => page.evaluate(statusReaders)).toEqual(metrics);
  });
}

test('Form useFormItemStatus stays live without replacing the control or registering a new ref', async ({ page }) => {
  await page.goto('/?fixture=form-use-status');
  const input = page.getByRole('textbox', { name: 'Status control', exact: true });
  await input.fill('Edited draft');
  await input.evaluate((node: HTMLInputElement) => {
    node.setSelectionRange(1, 4);
  });
  const original = await input.elementHandle();

  for (const id of ['errors-warnings', 'pending', 'success-with-errors', 'empty-with-errors', 'default']) {
    await page.getByRole('combobox', { name: 'Form use status sample', exact: true }).evaluate(
      (node: HTMLSelectElement, id) => {
        node.value = id;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect.poll(() => page.evaluate(statusReaders))
      .toEqual(reference.cases.find(({ sample }) => sample.id === id)!.metrics);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Edited draft');
    expect(await input.evaluate((node, previous) => node === previous, original)).toBe(true);
    expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual([1, 4]);
    await page.getByRole('button', { name: 'Inspect status instance', exact: true })
      .evaluate((node: HTMLButtonElement) => node.click());
    await expect(page.getByRole('status', { name: 'Status instance', exact: true }))
      .toHaveText('true');
  }
});

test('Form useFormItemStatus clears on reset and follows OTP status while retaining outer messages', async ({ page }) => {
  await page.goto('/?fixture=form-use-status');
  await page.getByRole('combobox', { name: 'Form use status sample', exact: true })
    .selectOption('errors-warnings');
  await page.getByRole('button', { name: 'Show status OTP', exact: true }).click();
  await expect.poll(async () => (await page.evaluate(statusReaders)).otp)
    .toEqual({ status: 'warning', errors: ['Invalid'], warnings: ['Check'] });

  await page.getByRole('button', { name: 'Reset status readers', exact: true }).click();
  await expect.poll(async () => (await page.evaluate(statusReaders)).main)
    .toEqual({ status: '', errors: [], warnings: [] });
});
