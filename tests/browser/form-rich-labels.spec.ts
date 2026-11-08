import { test, expect } from './test';
import { formRichLabelsMetrics } from './form-rich-labels-metrics';
import reference from './fixtures/ant-design-form-rich-labels-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form rich labels match source rendering and requiredMark input for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-rich-labels');
    await page.getByRole('combobox', { name: 'Form rich labels sample', exact: true })
      .selectOption(sample.id);
    await expect.poll(() => page.evaluate(formRichLabelsMetrics)).toEqual(metrics);
  });
}

test('Form label snippets reset their local state with the selected field as in source', async ({ page }) => {
  await page.goto('/?fixture=form-rich-labels');
  await page.getByRole('combobox', { name: 'Form rich labels sample', exact: true }).selectOption('counter');
  const actions: Record<string, string> = { clicked: 'Counter 0', reset: 'Reset rich field' };

  for (const { phase, metrics } of reference.lifecycle) {
    if (phase !== 'initial') await page.getByRole('button', { name: actions[phase], exact: true }).click();
    await expect.poll(() => page.evaluate(formRichLabelsMetrics)).toEqual(metrics);
  }
});

test('Form rich label updates preserve native controls, focus, selection and metadata', async ({ page }) => {
  await page.goto('/?fixture=form-rich-labels');
  await page.getByRole('combobox', { name: 'Form rich labels sample', exact: true }).selectOption('rich-default');
  const input = page.locator('[data-rich-label-case] input');
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed rich label metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();
  const metadata = await page.getByRole('status', { name: 'Rich label metadata', exact: true }).textContent();
  await page.getByRole('button', { name: 'Update rich caption', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );

  await expect(input).toHaveAccessibleName(/Updated caption:/);
  for (const id of ['rich-custom', 'zero-custom', 'nested-default', 'false-default', 'rich-array-default']) {
    await page.getByRole('combobox', { name: 'Form rich labels sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Stored error Stored note');
    await expect(page.getByRole('status', { name: 'Rich label metadata', exact: true })).toHaveText(metadata!);
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
  }
});

test('Form rich labels name composite controls and keep explicit ARIA priorities during updates', async ({ page }) => {
  await page.goto('/?fixture=form-rich-labels');
  await page.getByRole('button', { name: 'Show rich controls', exact: true }).click();
  const controls = page.locator('[data-rich-controls]');
  const radio = controls.locator('.rich-radio [role="radiogroup"]');
  const checkbox = controls.locator('.rich-checkbox [role="group"]');
  const otp = controls.locator('.rich-otp [role="group"]');
  const single = controls.locator('.rich-slider input[type="range"]');
  const range = controls.locator('.rich-range input[type="range"]');
  const color = controls.locator('.rich-color button');
  const named = [radio, checkbox, otp, single, range.nth(0), range.nth(1), color];
  const kinds = ['radio', 'checkbox', 'otp', 'slider', 'range', 'range', 'color'];
  for (const [index, control] of named.entries()) {
    await expect(control).toHaveAccessibleName(`Choices ${kinds[index]}`);
  }
  const original = await single.elementHandle();

  await page.getByRole('button', { name: 'Update control captions', exact: true }).click();
  for (const [index, control] of named.entries()) {
    await expect(control).toHaveAccessibleName(`Updated choices ${kinds[index]}`);
  }
  await controls.locator('.rich-radio > .ant-form-item-row > .ant-form-item-label > label').click();
  await expect(radio.getByRole('radio', { name: 'Alpha', exact: true })).toBeFocused();
  await controls.getByRole('button', { name: 'Toggle own rich names', exact: true }).click();
  const owner = ['radio', 'checkbox', 'otp', 'slider', 'start', 'end', 'color'];
  for (const [index, control] of named.entries()) {
    await expect(control).toHaveAccessibleName(`Owner ${owner[index]}`);
  }
  await controls.getByRole('button', { name: 'Toggle external rich names', exact: true }).click();
  for (const control of named) await expect(control).toHaveAccessibleName('External label');
  await controls.getByRole('button', { name: 'Toggle external rich names', exact: true }).click();
  await controls.getByRole('button', { name: 'Toggle own rich names', exact: true }).click();
  await controls.getByRole('button', { name: 'Toggle plain control labels', exact: true }).click();
  for (const [index, control] of named.entries()) {
    await expect(control).toHaveAccessibleName(`Updated choices ${kinds[index]}`);
  }
  expect(await single.evaluate((element, old) => element === old, original)).toBe(true);
  await controls.locator('.rich-radio > .ant-form-item-row > .ant-form-item-label > label').click();
  await expect(radio.getByRole('radio', { name: 'Alpha', exact: true })).toBeFocused();
});
