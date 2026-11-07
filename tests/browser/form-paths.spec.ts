import { test, expect } from './test';
import reference from './fixtures/ant-design-form-name-paths-observation.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=form-paths');
  await expect(page.locator('#form-paths-fixture')).toBeVisible();
});

test('Form follows pinned source NamePath, merge, array replacement and reset', async ({ page }) => {
  const values = page.getByRole('status', { name: 'Nested values', exact: true });

  for (const sample of reference.cases) {
    if (sample.id === 'nested-errors') continue;

    if (sample.id === 'nested-write') {
      await page.getByRole('button', { name: 'Set nested name', exact: true }).click();
    } else if (sample.id === 'merge-and-array-replacement') {
      await page.getByRole('button', { name: 'Merge nested values', exact: true }).click();
    } else if (sample.id === 'numeric-segments') {
      await page.getByRole('button', { name: 'Create numeric paths', exact: true }).click();
    } else if (sample.id === 'reset') {
      await page.getByRole('button', { name: 'Reset nested form', exact: true }).click();
    }

    await expect.poll(async () => JSON.parse((await values.textContent())!)).toEqual(sample.values);
  }
});

test('Form connects nested errors, labels and native names without conflating literal keys', async ({ page }) => {
  const title = page.getByLabel('Row title', { exact: true });

  await title.fill('');
  await title.blur();
  await expect(title).toHaveAccessibleDescription('Title required');
  await page.getByRole('button', { name: 'Submit nested form', exact: true }).click();

  await expect(title).toBeFocused();
  await expect(title).toHaveAccessibleDescription('Title required');
  await expect(title).toHaveAttribute('name', 'rows_0_title');
  const sample = reference.cases.find((entry) => entry.id === 'nested-errors')!;
  await expect.poll(async () => JSON.parse((await page.getByRole('status', {
    name: 'Nested errors', exact: true
  }).textContent())!)).toEqual(sample.errorFields);
  await expect(page.getByRole('status', { name: 'Validation out of date', exact: true }))
    .toHaveText('false');

  await title.fill('Saved');
  await page.getByRole('button', { name: 'Submit nested form', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Submitted nested values', exact: true }))
    .toContainText('"rows":[{"title":"Saved"},{"title":"Second"}]');
  expect(await page.locator('#form-paths-fixture form').evaluate((form) =>
    Array.from(new FormData(form as HTMLFormElement).entries())
  )).toEqual([['user_name', 'Anna'], ['user.name', 'Literal'], ['rows_0_title', 'Saved']]);
});

test('Form preserves the focused native control when its NamePath changes', async ({ page }) => {
  const title = page.getByLabel('Row title', { exact: true });
  const id = await title.getAttribute('id');
  await title.focus();
  await page.getByRole('button', { name: 'Change field path', exact: true }).evaluate((button) =>
    (button as HTMLButtonElement).click()
  );

  await expect(title).toHaveValue('Second');
  await expect(title).toHaveAttribute('id', id!);
  await expect(title).toHaveAttribute('name', 'rows_1_title');
  await expect(title).toBeFocused();

  await title.fill('Updated second');
  await page.getByRole('button', { name: 'Submit nested form', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Submitted nested values', exact: true }))
    .toContainText('"rows":[{"title":"First"},{"title":"Updated second"}]');
});

test('Form discards async errors after a registered field is removed', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Hold title validation', exact: true }).check();
  const title = page.getByLabel('Row title', { exact: true });
  await title.fill('Pending');
  await title.blur();
  await expect(page.getByRole('status', { name: 'Pending title validations', exact: true })).toHaveText('1');

  await page.getByRole('button', { name: 'Toggle row field', exact: true }).click();
  await page.getByRole('button', { name: 'Reject pending title', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Pending title validations', exact: true })).toHaveText('0');
  await page.getByRole('checkbox', { name: 'Hold title validation', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Toggle row field', exact: true }).click();

  await expect(title).toHaveValue('Pending');
  await expect(title).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('status', { name: 'Title touched', exact: true })).toHaveText('false');
});

test('Form renders reserved own keys without changing object prototypes', async ({ page }) => {
  await page.getByRole('button', { name: 'Create reserved paths', exact: true }).click();

  await expect.poll(async () => JSON.parse((await page.getByRole('status', {
    name: 'Nested values', exact: true
  }).textContent())!)).toMatchObject(JSON.parse(
    '{"__proto__":{"formStorePolluted":true},"constructor":{"prototype":{"polluted":true}}}'
  ));
  expect(await page.evaluate(() => ({
    first: Object.hasOwn(Object.prototype, 'formStorePolluted'),
    second: Object.hasOwn(Object.prototype, 'polluted')
  }))).toEqual({ first: false, second: false });
  await expect(page.getByLabel('Nested name', { exact: true })).toHaveValue('Anna');
  await page.getByRole('button', { name: 'Submit nested form', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Submitted nested values', exact: true }))
    .toContainText('"__proto__":{"formStorePolluted":true}');
  await expect(page.getByRole('status', { name: 'Submission failure', exact: true })).toBeEmpty();
});

test('Form retains model rules when an initial field leaves the DOM', async ({ page }) => {
  const literal = page.getByLabel('Literal name', { exact: true });
  await literal.fill('');
  await literal.blur();
  await expect(literal).toHaveAccessibleDescription('Literal required');
  await page.getByRole('button', { name: 'Toggle literal field', exact: true }).click();
  await expect(literal).toHaveCount(0);
  await page.getByRole('button', { name: 'Submit nested form', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Nested errors', exact: true }))
    .toHaveText('[{"name":["user.name"],"errors":["Literal required"],"warnings":[]}]');
  await expect(page.getByRole('status', { name: 'Submitted nested values', exact: true })).toBeEmpty();
});
