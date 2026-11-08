import { test, expect } from './test';
import { formNoStyleMetrics } from './form-no-style-metrics';
import reference from './fixtures/ant-design-form-no-style-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form noStyle follows source layout, own status and parent messages for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-no-style');
    await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
      .selectOption(sample.id);
    const expected = structuredClone(metrics);
    if (expected.input.status === 'error') expected.input.invalid = 'true';
    // Source описывает отсутствующий собственный help; native связывает с реальным parent message.
    if (!expected.child) {
      const hasOwn = expected.contexts.first.errors.length || expected.contexts.first.warnings.length;
      const hasParent = expected.parent
        && (expected.parent.errors.length || expected.parent.warnings.length);
      expected.input.descriptionPresent = !('helpFalse' in sample && sample.helpFalse)
        && !!hasOwn && !!hasParent;
      expected.input.descriptionConnected = expected.input.descriptionPresent;
    }

    await expect.poll(() => page.evaluate(formNoStyleMetrics)).toEqual(expected);
  });
}

test('Form noStyle keeps source message insertion order from metadata events', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
    .selectOption('event-order');

  await expect.poll(() => page.evaluate(formNoStyleMetrics)).toEqual({
    ...reference.eventOrder,
    input: { ...reference.eventOrder.input, descriptionConnected: true }
  });
});

test('Form noStyle updates collection on noStyle/help changes instead of retaining source stale messages', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
    .selectOption('error');
  const parent = page.locator('.capture-parent');
  const messages = parent.locator('.ant-form-item-explain-error');
  await expect(messages).toHaveCount(1);

  await page.getByRole('button', { name: 'Toggle no style layout', exact: true }).click();
  await expect(page.locator('.capture-child .ant-form-item-explain-error')).toHaveText('Invalid');
  await expect(messages).toHaveCount(1);
  await expect(parent.locator('.ant-form-item-explain').filter({
    has: page.locator('.ant-form-item-explain-error')
  })).toHaveCount(1);
  expect((await page.evaluate(formNoStyleMetrics)).parent?.errors).toEqual([]);

  await page.getByRole('button', { name: 'Toggle no style layout', exact: true }).click();
  await expect.poll(async () => (await page.evaluate(formNoStyleMetrics)).parent?.errors)
    .toEqual(['Invalid']);
  await page.getByRole('button', { name: 'Toggle no style help', exact: true }).click();
  await expect(messages).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'first', exact: true }))
    .not.toHaveAttribute('aria-describedby');
  await page.getByRole('button', { name: 'Toggle no style help', exact: true }).click();
  await expect(messages).toHaveText('Invalid');
});

test('Form noStyle retains native focus/selection across reset and releases collected errors on unmount', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
    .selectOption('error');
  const input = page.getByRole('textbox', { name: 'first', exact: true });
  await input.focus();
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 3); });
  const old = await input.elementHandle();

  await page.getByRole('button', { name: 'Reset no style field', exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, previous) => node === previous, old)).toBe(false);
  expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
    .toEqual([1, 3]);
  await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(0);
  await page.getByRole('button', { name: 'Toggle no style field', exact: true }).click();
  await expect(input).toHaveCount(0);
  await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(0);
});

test('Form noStyle separates silent validation, connects visible errors and focuses the invalid control', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
    .selectOption('required');
  const input = page.getByRole('textbox', { name: 'first', exact: true });
  await input.fill('');
  await page.getByRole('button', { name: 'Validate no style silently', exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.getByRole('status', { name: 'No style validation', exact: true }))
    .toHaveText('invalid');
  await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(0);

  const submit = page.getByRole('button', { name: 'Submit no style form', exact: true });
  await submit.focus();
  await expect(input).toHaveAccessibleDescription('Required');
  await submit.click();
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('Required');
});

test('Form noStyle publishes async errors and clears them when their field is removed', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
    .selectOption('async');
  await page.getByRole('button', { name: 'Validate no style visibly', exact: true }).click();
  await expect.poll(async () => (await page.evaluate(formNoStyleMetrics)).input.status)
    .toBe('validating');
  await page.getByRole('button', { name: 'Release no style validation', exact: true }).click();
  await expect(page.locator('.capture-parent .ant-form-item-explain-error')).toHaveText('Async error');
  await page.getByRole('button', { name: 'Toggle no style field', exact: true }).click();
  await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(0);
});

test('Form noStyle routes nested messages to the nearest styled item', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
    .selectOption('nested');
  const outer = page.locator('.no-style-outer');
  const inner = page.locator('.no-style-inner');

  await expect(outer.locator(':scope > .ant-form-item-row > .ant-form-item-control > .ant-form-item-explain .ant-form-item-explain-error'))
    .toHaveText('First error');
  await expect(outer.locator('.ant-form-item-explain-warning')).toHaveText('Second warning');
  await expect(inner.locator('.ant-form-item-explain-error')).toHaveText('Third error');
  await expect(outer).not.toHaveClass(/ant-form-item-has-error/);
  await expect(inner).not.toHaveClass(/ant-form-item-has-error/);
  await expect(page.getByRole('textbox', { name: 'Nested first', exact: true }))
    .toHaveAccessibleDescription('First error Second warning');
  await expect(page.getByRole('textbox', { name: 'Nested second', exact: true }))
    .toHaveAccessibleDescription('First error Second warning');
  await expect(page.getByRole('textbox', { name: 'Nested third', exact: true }))
    .toHaveAccessibleDescription('Third error');
});

test('Form noStyle keeps keyed list messages through move, insert and removal', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
    .selectOption('list');
  const messages = page.locator('.no-style-list-parent .ant-form-item-explain-error');
  const anna = page.getByRole('textbox', { name: 'User 0', exact: true });
  const bob = page.getByRole('textbox', { name: 'User 1', exact: true });
  await expect(messages).toHaveText(['Bob error', 'Anna error']);
  const original = await anna.elementHandle();

  await page.getByRole('button', { name: 'Move no style user 1 to first', exact: true }).click();
  await expect(bob).toHaveValue('Bob');
  await expect(anna).toHaveValue('Anna');
  expect(await anna.evaluate((node, previous) => node === previous, original)).toBe(true);
  await expect(messages).toHaveText(['Bob error', 'Anna error']);
  await page.getByRole('button', { name: 'Insert no style user', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'User 2', exact: true })).toHaveValue('Cora');
  await expect(messages).toHaveText(['Bob error', 'Anna error']);
  await page.getByRole('button', { name: 'Remove no style user 1', exact: true }).click();
  await expect(messages).toHaveText(['Anna error']);
  await expect(anna).toHaveAccessibleDescription('Anna error');
  await page.getByRole('button', { name: 'Remove no style user 0', exact: true }).click();
  await expect(messages).toHaveCount(0);
});

test('Form noStyle reset respects focus moved by the caller', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  const input = page.getByRole('textbox', { name: 'first', exact: true });
  await input.focus();
  await page.getByRole('button', { name: 'Reset no style and move focus', exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.getByRole('textbox', { name: 'No style owner focus', exact: true })).toBeFocused();
});

test('Form noStyle ignores an async result completed after its field is removed', async ({ page }) => {
  await page.goto('/?fixture=form-no-style');
  await page.getByRole('combobox', { name: 'Form no style sample', exact: true })
    .selectOption('async');
  await page.getByRole('button', { name: 'Validate no style visibly', exact: true }).click();
  await expect.poll(async () => (await page.evaluate(formNoStyleMetrics)).input.status)
    .toBe('validating');
  await page.getByRole('button', { name: 'Toggle no style field', exact: true }).click();
  await page.getByRole('button', { name: 'Release no style validation', exact: true }).click();
  await expect(page.getByRole('status', { name: 'No style validation', exact: true }))
    .toHaveText('invalid');
  await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(0);
});
