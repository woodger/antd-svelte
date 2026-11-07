import { test, expect } from './test';
import reference from './fixtures/ant-design-form-set-fields-observation.json' with { type: 'json' };

test('Form setFields matches source metadata, batch values, typed paths and manual validation flags', async ({ page }) => {
  await page.goto('/?fixture=form-set-fields');
  await expect(page.locator('#form-set-fields-fixture')).toBeVisible();

  for (const { id, inputs, ...expected } of reference.cases) {
    if (id === 'ruleless-pending') {
      await page.getByRole('button', { name: 'Validate bare set field', exact: true }).click();
    } else if (id === 'ruleless-complete') {
      await expect(page.getByRole('status', { name: 'Set fields bare done', exact: true }))
        .toHaveText('true');
    } else if (id === 'reset') await page.getByRole('button', { name: 'Reset set fields', exact: true }).click();
    else if (id === 'pending' || id === 'second-pending') {
      await page.getByRole('button', { name: 'Validate set field', exact: true }).click();
      await expect(page.getByRole('status', { name: 'Set fields pending', exact: true }))
        .toHaveText(id === 'pending' ? '[0]' : '[1]');
    } else if (id === 'validation-complete' || id === 'overridden-complete') {
      const index = id === 'validation-complete' ? 0 : 1;
      await page.getByRole('button', { name: `Complete set fields ${index}`, exact: true }).click();
      await expect.poll(async () => JSON.parse((await page.getByRole('status', {
        name: 'Set fields finished', exact: true
      }).textContent())!)).toContain(index);
    } else if (id !== 'initial') {
      await page.getByRole('button', { name: `Set fields ${id}`, exact: true }).click();
    }

    await expect.poll(async () => JSON.parse((await page.getByRole('status', {
      name: 'Set fields snapshot', exact: true
    }).textContent())!)).toEqual(expected);
    expect(await page.locator('#form-set-fields-fixture input').evaluateAll((elements) =>
      elements.map((element) => (element as HTMLInputElement).value)
    )).toEqual(inputs);
  }
});

test('Form setFields retains fresh messages when an older validator completes for a changed value', async ({ page }) => {
  await page.goto('/?fixture=form-set-fields');
  await page.getByRole('button', { name: 'Validate set field', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Set fields pending', exact: true })).toHaveText('[0]');
  await page.getByRole('button', { name: 'Set fields fresh-value', exact: true }).click();
  const input = page.getByLabel('Set field 0', { exact: true });
  await expect(input).toHaveValue('New value');
  await expect(input).toHaveAccessibleDescription('Server after write');
  await page.getByRole('button', { name: 'Complete set fields 0', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Set fields finished', exact: true })).toHaveText('[0]');

  await expect(input).toHaveValue('New value');
  await expect(input).toHaveAccessibleDescription('Server after write');
  await expect.poll(async () => JSON.parse((await page.getByRole('status', {
    name: 'Set fields snapshot', exact: true
  }).textContent())!)).toMatchObject({ meta: [
    { validating: false, validated: false, errors: ['Server after write'] }, {}, {}, {}, {}
  ] });
  await page.getByRole('button', { name: 'Validate set field', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Set fields pending', exact: true })).toHaveText('[1]');
  await page.getByRole('button', { name: 'Complete set fields 1', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Set fields finished', exact: true })).toHaveText('[0,1]');
  await expect(input).toHaveAccessibleDescription('');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
});

test('Form setFields updates accessible errors while retaining input focus, selection and native FormData', async ({ page }) => {
  await page.goto('/?fixture=form-set-fields');
  const input = page.getByLabel('Set field 0', { exact: true });
  await page.getByRole('button', { name: 'Set fields server-messages', exact: true }).click();
  await expect(input).toHaveAccessibleDescription('Server error Heads up');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 3); });
  const retained = await input.elementHandle();
  await page.getByRole('button', { name: 'Set fields unbound-metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );

  await expect(input).toBeFocused();
  expect(await input.evaluate((element, previous) => element === previous, retained)).toBe(true);
  expect(await input.evaluate((element: HTMLInputElement) =>
    [element.selectionStart, element.selectionEnd]
  )).toEqual([1, 3]);
  expect(await page.locator('#form-set-fields-fixture form').evaluate((form: HTMLFormElement) =>
    new FormData(form).get('name')
  )).toBe('Anna');
});

test('Form remounts a local root validator after reset and continues to register one control per field', async ({ page }) => {
  await page.goto('/?fixture=form-set-fields');
  await page.getByRole('button', { name: 'Reset set fields', exact: true }).click();
  await page.getByRole('button', { name: 'Validate set field', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Set fields pending', exact: true })).toHaveText('[0]');
  await page.getByRole('button', { name: 'Complete set fields 0', exact: true }).click();
  await expect(page.getByLabel('Set field 0', { exact: true }))
    .toHaveAccessibleDescription('Async rejected');
  await expect(page.locator('#form-set-fields-fixture input')).toHaveCount(5);
});
