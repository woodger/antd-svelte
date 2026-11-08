import { test, expect } from './test';
import { formDisabledMetrics } from './form-disabled-metrics';
import reference from './fixtures/ant-design-form-disabled-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form disabled inheritance matches source nested and local priority for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-disabled');
    await page.getByRole('combobox', { name: 'Form disabled sample', exact: true })
      .selectOption(sample.id);
    await expect.poll(() => page.evaluate(formDisabledMetrics)).toEqual(metrics);
  });
}

test('Form disabled updates preserve native controls, selection and free Select value', async ({ page }) => {
  await page.goto('/?fixture=form-disabled');
  const select = page.getByRole('combobox', { name: 'Free select', exact: true });
  await select.click();
  await page.getByRole('option', { name: 'Beta', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Input', exact: true });
  await input.fill('Draft edited');
  await input.evaluate((node: HTMLInputElement) => {
    node.setSelectionRange(1, 4);
  });
  const original = await input.elementHandle();

  for (const id of ['form-disabled', 'child-config-enable', 'form-enabled-over-config', 'default']) {
    await page.getByRole('combobox', { name: 'Form disabled sample', exact: true }).evaluate(
      (node: HTMLSelectElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect.poll(() => page.evaluate(formDisabledMetrics))
      .toEqual(reference.cases.find(({ sample }) => sample.id === id)!.metrics);
    await expect(input).toHaveValue('Draft edited');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual([1, 4]);
    await expect(page.getByRole('status', { name: 'Disabled selections', exact: true }))
      .toHaveText('b');
  }
  await select.click();
  await expect(page.getByRole('option', { name: 'Beta', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
});

test('Form keeps native submitting locks separate from inherited disabled and local props', async ({ page }) => {
  await page.goto('/?fixture=form-disabled');
  const submit = page.getByRole('button', { name: 'Submit disabled form', exact: true });
  await submit.click();
  await expect(page.getByRole('status', { name: 'Disabled submission', exact: true }))
    .toHaveText('pending');

  await expect(page.getByRole('textbox', { name: 'Bound input', exact: true })).toBeDisabled();
  await expect(page.getByRole('combobox', { name: 'Bound select', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Bound action', exact: true })).toBeDisabled();
  await expect(submit).toBeDisabled();
  await expect(page.getByRole('textbox', { name: 'Explicit enabled input', exact: true }))
    .toBeEnabled();
  await expect(page.getByRole('combobox', { name: 'Free select', exact: true })).toBeEnabled();

  await page.getByRole('button', { name: 'Release disabled submission', exact: true }).click();
  await expect(submit).toBeEnabled();
  await expect(page.getByRole('textbox', { name: 'Bound input', exact: true }))
    .toHaveValue('Draft');
});
