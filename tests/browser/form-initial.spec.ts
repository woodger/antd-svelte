import { test, expect } from './test';
import { formInitialMetrics } from './form-initial-metrics';
import reference from './fixtures/ant-design-form-initial-reference.json' with { type: 'json' };

for (const { sample, initial, selectedReset, fullReset } of reference.cases) {
  test(`Form field initial values match source initialization and resets for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-initial');
    await page.getByRole('combobox', { name: 'Form initial sample', exact: true })
      .selectOption(sample.id);
    await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(initial);

    await page.getByRole('button', { name: 'Edit initial model', exact: true }).click();
    await page.getByRole('button', { name: 'Reset selected initial', exact: true }).click();
    await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(selectedReset);
    await page.getByRole('button', { name: 'Edit initial model', exact: true }).click();
    await page.getByRole('button', { name: 'Reset all initial', exact: true }).click();
    await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(fullReset);
  });
}

for (const { sample, before, mounted } of reference.lateMount) {
  test(`Form field initial value respects existing store when mounted for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-initial');
    await page.getByRole('combobox', { name: 'Form initial sample', exact: true })
      .selectOption(`late-${sample.id}`);
    await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(before);

    await page.getByRole('button', { name: 'Mount initial field', exact: true }).click();
    await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(mounted);
  });
}

test('Form retains a current value when initialValue changes and uses the latest default on reset', async ({ page }) => {
  await page.goto('/?fixture=form-initial');
  await page.getByRole('combobox', { name: 'Form initial sample', exact: true })
    .selectOption('update');
  const input = page.getByRole('textbox', { name: 'Field 0', exact: true });
  await input.focus();
  await input.evaluate((node: HTMLInputElement) => {
    node.setSelectionRange(1, 3);
  });
  const original = await input.elementHandle();

  await page.getByRole('button', { name: 'Update initial default', exact: true }).evaluate(
    (node: HTMLButtonElement) => node.click()
  );
  await expect.poll(() => page.evaluate(formInitialMetrics))
    .toEqual(reference.defaultUpdate.updated.metrics);
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, previous) => node === previous, original))
    .toBe(reference.defaultUpdate.updated.same);
  expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
    .toEqual([1, 3]);

  await page.getByRole('button', { name: 'Reset all initial', exact: true }).click();
  await expect.poll(() => page.evaluate(formInitialMetrics))
    .toEqual(reference.defaultUpdate.reset.metrics);
  expect(await input.evaluate((node, previous) => node === previous, original))
    .toBe(reference.defaultUpdate.reset.same);
});

test('Form applies a default added after mount only on reset', async ({ page }) => {
  await page.goto('/?fixture=form-initial');
  await page.getByRole('combobox', { name: 'Form initial sample', exact: true })
    .selectOption('undefined');
  await page.getByRole('button', { name: 'Add initial default', exact: true }).click();
  await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(reference.propAdded);

  await page.getByRole('button', { name: 'Reset all initial', exact: true }).click();
  await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(reference.propAddedReset);
});

test('Form uses mount order for overlapping defaults when a child appears later', async ({ page }) => {
  await page.goto('/?fixture=form-initial');
  await page.getByRole('combobox', { name: 'Form initial sample', exact: true })
    .selectOption('late-overlap');
  await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(reference.lateOverlap.beforeChild);

  await page.getByRole('button', { name: 'Mount initial child', exact: true }).click();
  await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(reference.lateOverlap.withChild);
  await page.getByRole('button', { name: 'Reset all initial', exact: true }).click();
  await expect.poll(() => page.evaluate(formInitialMetrics)).toEqual(reference.lateOverlap.reset);
});
