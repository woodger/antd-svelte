import { test, expect } from './test';
import reference from './fixtures/ant-design-form-get-fields-value-observation.json' with { type: 'json' };

test('Form getFieldsValue matches source projections, nullable filter metadata, lists and validation', async ({ page }) => {
  await page.goto('/?fixture=form-get-fields-value');
  await expect(page.locator('#form-get-fields-value-fixture')).toBeVisible();
  const actions: Record<string, string> = {
    'literal-touched': 'Touch projection literal',
    'unbound-touched': 'Touch projection unbound',
    'silent-pending': 'Validate projection silently',
    'silent-complete': 'Complete projection 0',
    'normal-pending': 'Validate projection normally',
    'normal-complete': 'Complete projection 1',
    'store-update': 'Update projection store',
    removed: 'Hide projected fields', reset: 'Reset projected fields',
    'empty-form': 'Show empty projection', 'empty-list': 'Show empty projection list',
    list: 'Show projection list', 'list-touched': 'Touch projection row',
    'list-unmounted': 'Hide projected fields', 'list-reset': 'Reset projected fields'
  };

  for (const { id, ...expected } of reference.cases) {
    if (actions[id]) await page.getByRole('button', { name: actions[id], exact: true }).click();
    if (id === 'silent-pending' || id === 'normal-pending') {
      await expect(page.getByRole('status', { name: 'Projection pending', exact: true }))
        .toHaveText(id === 'silent-pending' ? '[0]' : '[1]');
    }
    if (id === 'silent-complete' || id === 'normal-complete') {
      await expect.poll(async () => JSON.parse((await page.getByRole('status', {
        name: 'Projection finished', exact: true
      }).textContent())!)).toContain(id === 'silent-complete' ? 0 : 1);
    }
    await expect.poll(async () => JSON.parse((await page.getByRole('status', {
      name: 'Projected snapshot', exact: true
    }).textContent())!)).toEqual(expected);
  }
});

test('Form value queries react to native edits without replacing the focused control or its selection', async ({ page }) => {
  await page.goto('/?fixture=form-get-fields-value');
  const input = page.getByLabel('Projected name', { exact: true });
  await input.fill('Draft');
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const retained = await input.elementHandle();
  await page.getByRole('button', { name: 'Update projection store', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );

  await expect(input).toHaveValue('Draft');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element, previous) => element === previous, retained)).toBe(true);
  expect(await input.evaluate((element: HTMLInputElement) =>
    [element.selectionStart, element.selectionEnd]
  )).toEqual([1, 4]);
  await expect.poll(async () => JSON.parse((await page.getByRole('status', {
    name: 'Projected snapshot', exact: true
  }).textContent())!)).toMatchObject({ values: {
    mounted: { user: { name: 'Draft' } }, store: { user: { name: 'Draft' }, unbound: 'Changed' }
  } });
});
