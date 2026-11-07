import { test, expect } from './test';
import touchedReference from './fixtures/ant-design-form-aggregate-touched-observation.json' with { type: 'json' };
import validatingReference from './fixtures/ant-design-form-aggregate-validating-observation.json' with { type: 'json' };

test('Form aggregate touched queries match source groups, bindings, empty selections and lists', async ({ page }) => {
  await page.goto('/?fixture=form-aggregate');
  await expect(page.locator('#form-aggregate-fixture')).toBeVisible();
  const actions: Record<string, string> = {
    name: 'Touch name', role: 'Touch role', literal: 'Touch literal',
    numeric: 'Touch numeric', string: 'Touch string', reset: 'Reset aggregate',
    'ruleless-pending': 'Check ruleless', 'empty-form': 'Show empty form',
    'empty-list': 'Show empty list', 'rows-initial': 'Show rows',
    'first-row': 'Touch first person', 'both-rows': 'Touch second person', 'rows-reset': 'Reset aggregate'
  };

  for (const sample of touchedReference.cases.filter(({ id }) => !id.startsWith('flat-'))) {
    if (actions[sample.id]) {
      await page.getByRole('button', { name: actions[sample.id], exact: true }).click();
    }
    const { rootAny, rootAll, undefinedAll, ...expected } = sample.touched;
    await expect.poll(async () => {
      const actual = JSON.parse((await page.getByRole('status', {
        name: 'Aggregate touched', exact: true
      }).textContent())!);
      const { rootAny: root, rootAll: allRoot, undefinedAll: noNames, ...rest } = actual;
      return { ...rest, rootSafe: root === actual.any && allRoot === actual.any, overloadSafe: noNames === actual.all };
    }).toEqual({ ...expected, rootSafe: true, overloadSafe: true });
    await expect(page.getByRole('status', { name: 'Aggregate validating', exact: true }))
      .toHaveText(String(sample.validating));

    if (sample.id === 'ruleless-pending') {
      const snapshot = JSON.parse((await page.getByRole('status', {
        name: 'Ruleless during', exact: true
      }).textContent())!);
      expect(snapshot.validating).toBe(false);
    }
    expect(rootAny.error).toContain('not iterable');
    expect(rootAll.error).toContain('not iterable');
    expect(undefinedAll.error).toContain('map');
  }
});

test('Form aggregate all tracks actual bindings and resets after native child blur', async ({ page }) => {
  await page.goto('/?fixture=form-aggregate');
  await expect(page.locator('#form-aggregate-fixture')).toBeVisible();
  await page.getByLabel('User name', { exact: true }).focus();
  await page.getByLabel('User name', { exact: true }).blur();

  await expect.poll(async () => JSON.parse((await page.getByRole('status', {
    name: 'Aggregate touched', exact: true
  }).textContent())!)).toMatchObject({ any: true, all: false, userAll: true, leavesAll: false });

  await page.getByRole('button', { name: 'Reset aggregate', exact: true }).click();
  await expect.poll(async () => JSON.parse((await page.getByRole('status', {
    name: 'Aggregate touched', exact: true
  }).textContent())!)).toMatchObject({ any: false, all: false, userAll: false });
});

test('Form aggregate validating matches source exact paths, silent requests, reset and unmount', async ({ page }) => {
  await page.goto('/?fixture=form-validating-aggregate');
  await expect(page.locator('#form-validating-aggregate-fixture')).toBeVisible();
  const actions: Record<string, string> = {
    'ruleless-pending': 'Check bare aggregate', 'nested-pending': 'Validate nested aggregate',
    'silent-pending': 'Validate literal silently', 'silent-complete': 'Complete aggregate 1',
    'numeric-pending': 'Validate numeric aggregate', 'nested-complete': 'Complete aggregate 0',
    'string-pending': 'Validate string aggregate', 'numeric-complete': 'Complete aggregate 2',
    'all-complete': 'Complete aggregate 3', 'before-reset': 'Validate nested aggregate',
    reset: 'Reset validating aggregate', 'reset-old-complete': 'Complete aggregate 4',
    'before-remove': 'Validate nested aggregate', removed: 'Remove nested aggregate',
    'removed-old-complete': 'Complete aggregate 5'
  };
  const completions: Record<string, number> = {
    'silent-complete': 1, 'nested-complete': 0, 'numeric-complete': 2,
    'all-complete': 3, 'reset-old-complete': 4, 'removed-old-complete': 5
  };

  for (const sample of validatingReference.cases) {
    if (actions[sample.id]) {
      await page.getByRole('button', { name: actions[sample.id], exact: true }).click();
    }
    if (sample.id in completions) {
      await expect.poll(async () => JSON.parse((await page.getByRole('status', {
        name: 'Aggregate finished', exact: true
      }).textContent())!)).toContain(completions[sample.id]);
    }

    await expect(page.getByRole('status', { name: 'Validating snapshot', exact: true }))
      .toHaveText(JSON.stringify(sample.validating));
    await expect(page.getByRole('status', { name: 'Validating single', exact: true }))
      .toHaveText(JSON.stringify(sample.single));
    if (sample.id === 'ruleless-pending') {
      await expect(page.getByRole('status', { name: 'Bare during', exact: true }))
        .toHaveText(JSON.stringify(sample.validating));
    }
  }
});
