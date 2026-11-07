import { test, expect } from './test';
import reference from './fixtures/ant-design-form-list-observation.json' with { type: 'json' };
import sparseReference from './fixtures/ant-design-form-sparse-list-observation.json' with { type: 'json' };

test.describe('FormList operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?fixture=form-list');
    await expect(page.locator('#form-list-fixture')).toBeVisible();
  });

  test('matches pinned source values, keys, native inputs and reset across list operations', async ({ page }) => {
    const actions: Record<string, string> = {
      insert: 'Insert Cora',
      move: 'Move last to first',
      'remove-many': 'Remove indices',
      'append-invalid-index': 'Append Dina',
      'ignore-invalid-move': 'Ignore invalid move',
      'external-replacement': 'Replace list',
      'external-shrink': 'Shrink list',
      'append-after-shrink': 'Append Hana',
      reset: 'Reset list'
    };

    for (const sample of reference.cases) {
      if (sample.id === 'fractional-move-observation') continue;
      if (actions[sample.id]) {
        await page.getByRole('button', { name: actions[sample.id], exact: true }).click();
      }

      await expect.poll(async () => JSON.parse((await page.getByRole('status', {
        name: 'List values', exact: true
      }).textContent())!)).toEqual(sample.values);
      await expect.poll(async () => JSON.parse((await page.getByRole('status', {
        name: 'List fields', exact: true
      }).textContent())!)).toEqual(sample.fields);
      expect(await page.locator('#form-list-fixture input.ant-input').evaluateAll((inputs) =>
        inputs.map((input) => ({ id: input.id, value: (input as HTMLInputElement).value }))
      )).toEqual(sample.inputs);
      await expect(page.getByRole('status', { name: 'List errors', exact: true }))
        .toHaveText(JSON.stringify(sample.errors));
    }
  });

  test('preserves the keyed input, focus and selection when a row moves', async ({ page }) => {
    const bob = page.getByLabel('User 1', { exact: true });
    const original = await bob.elementHandle();
    await bob.fill('Robert');
    await bob.evaluate((input) => (input as HTMLInputElement).setSelectionRange(1, 3));
    await page.getByRole('button', { name: 'Move user 1 to first', exact: true })
      .evaluate((button) => (button as HTMLButtonElement).click());

    await expect(page.locator('[data-list-key="1"]')).toHaveAttribute('data-list-index', '0');
    await expect(bob).toHaveAttribute('name', 'users_0_name');
    await expect(bob).toHaveValue('Robert');
    await expect(bob).toBeFocused();
    expect(await bob.evaluate((input, node) => input === node, original)).toBe(true);
    expect(await bob.evaluate((input) => [
      (input as HTMLInputElement).selectionStart, (input as HTMLInputElement).selectionEnd
    ])).toEqual([1, 3]);
    await original?.dispose();
  });

  test('allocates missing keys before rendering a larger external array', async ({ page }) => {
    const first = await page.locator('#user-0').elementHandle();
    const second = await page.locator('#user-1').elementHandle();
    await page.getByRole('button', { name: 'Grow list externally', exact: true }).click();

    await expect(page.locator('#form-list-fixture input.ant-input')).toHaveCount(5);
    await expect(page.getByLabel('User 4', { exact: true })).toHaveValue('Mira');
    expect(await page.locator('#user-0').evaluate((node, original) => node === original, first))
      .toBe(true);
    expect(await page.locator('#user-1').evaluate((node, original) => node === original, second))
      .toBe(true);
    await first?.dispose();
    await second?.dispose();
  });

  test('registers a replacement model through state without retaining old async errors', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Hold list validation', exact: true }).check();
    await page.getByLabel('User 1', { exact: true }).fill('Pending');
    await page.getByLabel('User 1', { exact: true }).blur();
    await expect(page.getByRole('status', { name: 'Pending name validations', exact: true }))
      .toHaveText('1');
    await page.getByRole('button', { name: 'Replace list model', exact: true }).click();
    await expect(page.getByLabel('User 0', { exact: true })).toHaveValue('Replacement model');
    await expect(page.getByLabel('User 1', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Reject pending names', exact: true }).click();
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Hold list validation', exact: true }).uncheck();
    await page.getByRole('button', { name: 'Submit list', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Submitted list', exact: true }))
      .toHaveText('{"users":[{"name":"Replacement model"}]}');
  });

  test('moves field errors with the keyed row and submits the current NamePath', async ({ page }) => {
    const bob = page.getByLabel('User 1', { exact: true });
    await bob.fill('');
    await bob.blur();
    await expect(bob).toHaveAccessibleDescription('Name required');
    await page.getByRole('button', { name: 'Move user 1 to first', exact: true }).click();

    await expect(bob).toHaveAttribute('name', 'users_0_name');
    await expect(bob).toHaveAccessibleDescription('Name required');
    await page.getByRole('button', { name: 'Submit list', exact: true }).click();

    await expect(page.getByRole('status', { name: 'List error fields', exact: true }))
      .toHaveText('[{"name":["users",0,"name"],"errors":["Name required"],"warnings":[]}]');
    await expect(bob).toBeFocused();
    await bob.fill('Saved');
    await page.getByRole('button', { name: 'Remove user 0', exact: true }).click();
    await page.getByRole('button', { name: 'Submit list', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Submitted list', exact: true }))
      .toHaveText('{"users":[{"name":"Saved"}]}');
    expect(await page.locator('#form-list-fixture form').evaluate((form) =>
      Array.from(new FormData(form as HTMLFormElement).entries())
    )).toEqual([['users_0_name', 'Saved']]);
  });

  test('retains row validation bindings after reset remounts the controls', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset list', exact: true }).click();
    const input = page.getByLabel('User 1', { exact: true });
    await input.fill('');
    await input.blur();

    await expect(input).toHaveAccessibleDescription('Name required');
    await page.getByRole('button', { name: 'Submit list', exact: true }).click();
    await expect(input).toBeFocused();
    await expect(page.getByRole('status', { name: 'List error fields', exact: true }))
      .toHaveText('[{"name":["users",1,"name"],"errors":["Name required"],"warnings":[]}]');
  });

  test('validates the list itself on removal and clears its error after adding a row', async ({ page }) => {
    await page.getByRole('button', { name: 'Remove all users', exact: true }).click();

    await expect(page.getByRole('status', { name: 'List errors', exact: true }))
      .toHaveText('["At least one user"]');
    await expect(page.getByRole('alert')).toHaveText('At least one user');
    await page.getByRole('button', { name: 'Append Hana', exact: true }).click();

    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('status', { name: 'List errors', exact: true })).toHaveText('[]');
    await page.getByRole('button', { name: 'Submit list', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Submitted list', exact: true }))
      .toHaveText('{"users":[{"name":"Hana"}]}');
  });

  for (const reset of [false, true]) {
    test(`ignores pending errors after ${reset ? 'reset' : 'removing a row'}`, async ({ page }) => {
      await page.getByRole('checkbox', { name: 'Hold list validation', exact: true }).check();
      const bob = page.getByLabel('User 1', { exact: true });
      await bob.fill('Pending');
      await bob.blur();
      await expect(page.getByRole('status', { name: 'Pending name validations', exact: true }))
        .toHaveText('1');
      await page.getByRole('button', { name: reset ? 'Reset list' : 'Remove user 1', exact: true }).click();
      await page.getByRole('button', { name: 'Reject pending names', exact: true }).click();
      await expect(page.getByRole('status', { name: 'Pending name validations', exact: true }))
        .toHaveText('0');

      await expect(page.getByRole('alert')).toHaveCount(0);
      if (reset) {
        await expect(bob).toHaveValue('Bob');
        await expect(bob).not.toHaveAttribute('aria-invalid', 'true');
      } else {
        await expect(bob).toHaveCount(0);
        await page.getByRole('button', { name: 'Append empty row', exact: true }).click();
        await expect(page.getByLabel('User 2', { exact: true })).toHaveValue('');
        await expect(page.getByLabel('User 2', { exact: true }))
          .not.toHaveAttribute('aria-invalid', 'true');
      }
    });
  }

  test('keeps the latest validation after moving a row while its old check is pending', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Hold list validation', exact: true }).check();
    const bob = page.getByLabel('User 1', { exact: true });
    await bob.fill('Pending');
    await bob.blur();
    await expect(page.getByRole('status', { name: 'Pending name validations', exact: true }))
      .toHaveText('1');
    await page.getByRole('button', { name: 'Move user 1 to first', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Pending name validations', exact: true }))
      .toHaveText('2');
    await page.getByRole('button', { name: 'Accept latest name', exact: true }).click();
    await page.getByRole('button', { name: 'Reject oldest name', exact: true }).click();
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

    await expect(page.getByRole('status', { name: 'Pending name validations', exact: true }))
      .toHaveText('0');
    await expect(bob).toHaveAttribute('name', 'users_0_name');
    await expect(bob).toHaveValue('Pending');
    await expect(bob).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('ignores fractional move indices without losing rows', async ({ page }) => {
    await page.getByRole('button', { name: 'Ignore fractional move', exact: true }).click();

    await expect(page.getByRole('status', { name: 'List values', exact: true }))
      .toHaveText('{"users":[{"name":"Anna"},{"name":"Bob"}]}');
    await expect(page.getByRole('status', { name: 'List fields', exact: true }))
      .toHaveText('[{"name":0,"key":0},{"name":1,"key":1}]');
  });
});

test('FormList initializes missing values, respects an empty Form default and resets fresh controls', async ({ page }) => {
  await page.goto('/?fixture=form-list-defaults');
  const user = page.getByLabel('Default user', { exact: true });
  await expect(user).toHaveValue('List default');
  await expect(page.getByRole('status', { name: 'Empty default fields', exact: true })).toHaveText('0');
  const original = await user.elementHandle();
  await user.fill('Changed');
  await page.getByRole('button', { name: 'Add default row', exact: true }).click();
  await page.getByRole('button', { name: 'Reset defaults', exact: true }).click();

  await expect(user).toHaveCount(1);
  await expect(user).toHaveValue('List default');
  expect(await original!.evaluate((node) => node.isConnected)).toBe(false);
  await original?.dispose();
  await page.getByRole('button', { name: 'Toggle default list', exact: true }).click();
  await expect(user).toHaveCount(0);
  await page.getByRole('button', { name: 'Toggle default list', exact: true }).click();
  await expect(user).toHaveValue('List default');
});

test('FormList reads an updated initialValue on reset without replacing the current draft', async ({ page }) => {
  await page.goto('/?fixture=form-list-defaults');
  const user = page.getByLabel('Default user', { exact: true });
  await user.fill('Current draft');
  await page.getByRole('button', { name: 'Replace list default', exact: true }).click();

  await expect(user).toHaveValue('Current draft');
  await page.getByRole('button', { name: 'Reset defaults', exact: true }).click();

  await expect(user).toHaveValue('Updated default');
});

test('FormList composes nested prefixes and keeps independent Form fields outside the prefix', async ({ page }) => {
  await page.goto('/?fixture=form-list-nested');
  const ada = page.getByLabel('Group 0 user 0', { exact: true });
  const nested = page.getByLabel('Group 1 user 0', { exact: true });
  await expect(ada).toHaveValue('Ada');
  await expect(nested).toHaveValue('Nested default');
  await expect(page.getByLabel('Independent title', { exact: true })).toHaveAttribute('name', 'title');
  await nested.fill('Edited nested');
  await page.getByRole('button', { name: 'Add user to group 1', exact: true }).click();
  await page.getByRole('button', { name: 'Move group 1 to first', exact: true }).click();

  await expect(nested).toHaveValue('Edited nested');
  await expect(nested).toHaveAttribute('name', 'groups_0_users_0_name');
  await expect(ada).toHaveAttribute('name', 'groups_1_users_0_name');
  await page.getByRole('button', { name: 'Submit nested lists', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Submitted nested lists', exact: true }))
    .toHaveText('{"groups":[{"title":"Second","users":[{"name":"Edited nested"},{"name":"New nested"}]},{"title":"First","users":[{"name":"Ada"}]}]}');
  await page.getByRole('button', { name: 'Remove group 0', exact: true }).click();
  await page.getByRole('button', { name: 'Reset nested lists', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Nested list values', exact: true }))
    .toHaveText('{"groups":[{"title":"First","users":[{"name":"Ada"}]},{"title":"Second","users":[{"name":"Nested default"}]}]}');
});

test('FormList renders only existing sparse positions with their original NamePath indices', async ({ page }) => {
  await page.goto('/?fixture=form-list-sparse');

  for (const sample of sparseReference.cases) {
    if (sample.id === 'append-after-sparse') {
      await page.getByRole('button', { name: 'Append Hana', exact: true }).click();
    }

    await expect.poll(async () => JSON.parse((await page.getByRole('status', {
      name: 'List fields', exact: true
    }).textContent())!)).toEqual(sample.renderedFields);
    await expect.poll(async () => JSON.parse((await page.getByRole('status', {
      name: 'List values', exact: true
    }).textContent())!)).toEqual(sample.values);
    expect(await page.locator('#form-list-sparse-fixture input.ant-input').evaluateAll((inputs) =>
      inputs.map((input) => ({ id: input.id, value: (input as HTMLInputElement).value }))
    )).toEqual(sample.inputs);
  }

  await expect(page.getByLabel('User 0', { exact: true })).toHaveAttribute('name', 'users_2_name');
});
