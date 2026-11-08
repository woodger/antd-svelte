import type { Page } from '@playwright/test';
import { test, expect } from './test';
import { formNamelessMetrics } from './form-nameless-metrics';
import reference from './fixtures/ant-design-form-nameless-reference.json' with { type: 'json' };

async function inspect(page: Page) {
  await page.getByRole('button', { name: 'Inspect nameless row', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  return page.evaluate(formNamelessMetrics);
}

async function choose(page: Page, id: string) {
  await page.getByRole('combobox', { name: 'Form name sample', exact: true }).selectOption(id);
}

for (const { sample, metrics } of reference.cases.filter(({ sample }) => sample.id !== 'named')) {
  test(`Nameless FormItem matches source ownership, labels and appearance for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-nameless');
    await choose(page, sample.id);
    await expect.poll(() => inspect(page)).toEqual(metrics);
  });
}

test('Nameless FormItem ignores local rules and retains explicit owner label association', async ({ page }) => {
  await page.goto('/?fixture=form-nameless');
  await choose(page, 'ignored-rules');
  const input = page.getByRole('textbox', { name: 'control', exact: true });
  await input.fill('');
  await page.getByRole('button', { name: 'Validate nameless form', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Nameless validation', exact: true })).toHaveText('valid');
  await expect(page.getByRole('alert')).toHaveCount(0);

  await choose(page, 'manual-label');
  await page.locator('.ant-form-item-label > label').click();
  await expect(input).toBeFocused();
});

test('Nameless FormItem keeps local draft, focus and selection through model reset', async ({ page }) => {
  await page.goto('/?fixture=form-nameless');
  const input = page.getByRole('textbox', { name: 'control', exact: true });
  await input.fill('Draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 3); });
  const previous = await input.elementHandle();

  await page.getByRole('button', { name: 'Reset nameless form', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await expect.poll(() => inspect(page)).toEqual(reference.reset.metrics);
  expect(await input.evaluate((node, old) => node === old, previous)).toBe(reference.reset.same);
  await expect(input).toBeFocused();
  expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
    .toEqual([1, 3]);
});

test('FormItem recreates its control when switching name ownership and keeps native named contracts', async ({ page }) => {
  await page.goto('/?fixture=form-nameless');
  const input = page.getByRole('textbox', { name: 'control', exact: true });
  const unbound = await input.elementHandle();

  await choose(page, 'named');
  await expect.poll(() => inspect(page)).toMatchObject({
    values: reference.named.metrics.values, instance: reference.named.metrics.instance,
    store: reference.named.metrics.store, input: { value: reference.named.metrics.input.value }
  });
  expect(await input.evaluate((node, old) => node === old, unbound)).toBe(reference.named.same);
  await expect(input).toHaveAttribute('name', 'name');
  expect(await input.evaluate((node: HTMLInputElement) => node.labels?.[0].control === node)).toBe(true);
  const named = await input.elementHandle();

  await choose(page, 'default');
  await expect.poll(() => inspect(page)).toEqual(reference.unnamed.metrics);
  expect(await input.evaluate((node, old) => node === old, named)).toBe(reference.unnamed.same);
});
