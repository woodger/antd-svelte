import { test, expect } from './test';
import { formLayoutMetrics } from './form-layout-metrics';
import reference from './fixtures/ant-design-form-layout-reference.json' with { type: 'json' };

for (const sample of reference.cases) {
  test(`Form layouts match source flow, spacing, labels and geometry for ${sample.sample.id}`, async ({ page }) => {
    await page.setViewportSize({ width: sample.sample.viewport, height: 900 });
    await page.goto('/?fixture=form-layout');
    await page.getByRole('combobox', { name: 'Form layout sample', exact: true }).selectOption(sample.sample.id);
    await expect.poll(() => page.evaluate(formLayoutMetrics)).toEqual(sample.metrics);
  });
}

test('Form changes layout and local overrides while keeping its native control, value, focus and metadata', async ({ page }) => {
  await page.goto('/?fixture=form-layout');
  const field = page.getByLabel('Role', { exact: true });
  await field.fill('Draft role');
  await page.getByRole('button', { name: 'Seed layout metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  const original = await field.elementHandle();
  await field.focus();
  await field.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });

  for (const layout of ['horizontal', 'vertical', 'inline']) {
    await page.getByRole('combobox', { name: 'Form layout', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, layout
    );
    const form = page.locator('[data-layout-root] form');
    await expect(form).toHaveClass(new RegExp(`ant-form-${layout}`));
    await expect(field).toBeFocused();
    await expect(field).toHaveValue('Draft role');
    await expect(field).toHaveAccessibleDescription('Role error Role note');
    expect(await field.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await field.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
  }

  await page.getByRole('combobox', { name: 'Role layout', exact: true }).selectOption('vertical');
  await expect(page.locator('[data-layout-root] .ant-form-item').nth(1))
    .toHaveClass(/ant-form-item-vertical/);
  await expect(page.locator('[data-layout-root] .ant-form-item').first())
    .toHaveClass(/ant-form-item-inline/);
  await page.getByRole('combobox', { name: 'Role layout', exact: true }).selectOption('inherit');
  await expect(page.locator('[data-layout-root] .ant-form-item').nth(1))
    .toHaveClass(/ant-form-item-inline/);
});

test('Form inline retains native form data, validation, focus, submit and reset', async ({ page }) => {
  await page.goto('/?fixture=form-layout');
  const name = page.getByLabel('Name', { exact: true });
  const form = page.locator('[data-layout-root] form');
  await name.fill('');
  await form.evaluate((element: HTMLFormElement) => { element.requestSubmit(); });
  await expect(name).toHaveAccessibleDescription('Name required');
  await expect(name).toBeFocused();

  await name.fill('New name');
  await form.evaluate((element: HTMLFormElement) => { element.requestSubmit(); });
  await expect(page.getByRole('status', { name: 'Layout submitted', exact: true }))
    .toHaveText('[{"name":"New name","role":"Editor"}]');
  expect(await form.evaluate((element: HTMLFormElement) => Object.fromEntries(new FormData(element))))
    .toEqual({ name: 'New name', role: 'Editor' });

  await form.evaluate((element: HTMLFormElement) => { element.reset(); });
  await expect(name).toHaveValue('Anna');
  await expect(page.getByRole('status', { name: 'Layout values', exact: true }))
    .toHaveText('{"name":"Anna","role":"Editor"}');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('Form inline styles stay within their form and component=false keeps only the context', async ({ page }) => {
  await page.goto('/?fixture=form-layout');
  const sibling = page.locator('#form-layout-fixture .ant-form-item').filter({
    has: page.getByLabel('Sibling', { exact: true })
  });
  const withoutWrapper = page.getByLabel('Without wrapper', { exact: true });
  await expect(sibling).toHaveClass(/ant-form-item-vertical/);
  await expect(sibling).toHaveCSS('margin-bottom', '24px');
  await expect(withoutWrapper).toHaveCount(1);
  expect(await withoutWrapper.evaluate((element) => element.closest('form') === null)).toBe(true);
  await expect(page.locator('#form-layout-fixture form')).toHaveCount(2);
});
