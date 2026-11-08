import { test, expect } from './test';
import { formSlotContextMetrics } from './form-slot-context-metrics';
import reference from './fixtures/ant-design-form-slot-context-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form explanation controls match source field isolation and form appearance for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-slot-context');
    await page.getByRole('combobox', { name: 'Form slot sample', exact: true }).selectOption(sample.id);
    await expect.poll(async () => {
      await page.getByRole('button', { name: 'Inspect slot bindings', exact: true }).evaluate(
        (button: HTMLButtonElement) => { button.click(); }
      );
      return page.evaluate(formSlotContextMetrics);
    }).toEqual(metrics);
  });
}

test('Form helper changes and blur keep the main value, touched, ref and native form data separate', async ({ page }) => {
  await page.goto('/?fixture=form-slot-context');
  const helper = page.getByRole('textbox', { name: 'extra draft', exact: true });
  await helper.fill('Edited helper');
  await page.locator('#slot-before').focus();
  await page.getByRole('button', { name: 'Inspect slot bindings', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await expect.poll(async () => {
    const { touched, mainValue } = await page.evaluate(formSlotContextMetrics);
    return { touched, value: mainValue };
  }).toEqual(reference.helperBlur);
  const main = page.getByRole('textbox', { name: 'main control', exact: true });
  await expect(main).toHaveValue('Main');
  expect(await main.evaluate((node: HTMLInputElement) => new FormData(node.form!).getAll('name')))
    .toEqual(['Main']);
});
