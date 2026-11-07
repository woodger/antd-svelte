import { test, expect } from './test';
import reference from './fixtures/ant-design-form-validation-options-observation.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=form-validation-options');
  await expect(page.locator('#form-validation-options-fixture')).toBeVisible();
});

test('Form matches pinned recursive selection, overlapping paths and typed segments', async ({ page }) => {
  const actions: Record<string, string> = {
    'parent-without-recursive': 'Validate parent',
    'recursive-parent': 'Validate descendants',
    'recursive-overlapping-paths': 'Validate overlapping',
    'recursive-number-segment': 'Validate numeric row',
    'literal-name': 'Validate literal'
  };
  for (const sample of reference.cases.filter(({ id }) => id in actions)) {
    if (sample.id === 'recursive-overlapping-paths') {
      await page.getByRole('button', { name: 'Reset nested options', exact: true }).click();
    }
    await page.getByRole('button', { name: actions[sample.id], exact: true }).click();

    await expect(page.getByRole('status', { name: 'Nested calls', exact: true }))
      .toHaveText(JSON.stringify(sample.calls));
    await expect(page.getByRole('status', { name: 'Nested result', exact: true }))
      .toHaveText(JSON.stringify(sample.result));
    await expect(page.getByRole('status', { name: 'Nested fields', exact: true }))
      .toHaveText(JSON.stringify(sample.fields));
  }
});

test('Form follows source dirty selection across silent checks, normal checks, reset and writes', async ({ page }) => {
  const steps: [string, string, string?][] = [
    ['dirty-pristine', 'Dirty validation'],
    ['silent-pristine', 'Silent validation'],
    ['dirty-after-silent', 'Dirty validation'],
    ['normal-pristine', 'Normal validation'],
    ['silent-preserves-error', 'Silent validation'],
    ['dirty-after-normal', 'Dirty validation'],
    ['dirty-after-reset', 'Dirty validation', 'Reset fresh'],
    ['dirty-after-same-value', 'Dirty validation', 'Set same undefined'],
    ['dirty-after-equal-merge', 'Dirty validation', 'Merge undefined'],
    ['dirty-after-merge', 'Dirty validation', 'Merge changed']
  ];
  for (const [id, action, before] of steps) {
    if (id === 'dirty-after-equal-merge') {
      await page.getByRole('button', { name: 'Replace empty model', exact: true }).click();
    }
    if (before) await page.getByRole('button', { name: before, exact: true }).click();
    await page.getByRole('button', { name: action, exact: true }).click();

    const sample = reference.cases.find((entry) => entry.id === id)!;
    await expect(page.getByRole('status', { name: 'Fresh calls', exact: true }))
      .toHaveText(JSON.stringify(sample.calls));
    await expect.poll(async () => {
      const results = JSON.parse((await page.getByRole('status', {
        name: 'Fresh results', exact: true
      }).textContent())!);
      return results.at(-1)?.result;
    }).toEqual(sample.result);
    await expect(page.getByRole('status', { name: 'Fresh fields', exact: true }))
      .toHaveText(JSON.stringify(sample.fields));
  }
});

test('Form includes falsy initial values in dirty checks while leaving undefined pristine', async ({ page }) => {
  const sample = reference.cases.find(({ id }) => id === 'dirty-initial-values')!;

  await page.getByRole('button', { name: 'Validate initial dirty', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Initial calls', exact: true }))
    .toHaveText(JSON.stringify(sample.calls));
  await expect(page.getByRole('status', { name: 'Initial result', exact: true }))
    .toHaveText(JSON.stringify(sample.result));
  await expect(page.getByRole('status', { name: 'Initial fields', exact: true }))
    .toHaveText(JSON.stringify(sample.fields));
});

test('Form honors options after undefined names without displaying errors', async ({ page }) => {
  const sample = reference.cases.find(({ id }) => id === 'undefined-name-list-options-observation')!;

  await page.getByRole('button', { name: 'Undefined names silent', exact: true }).click();

  await expect.poll(async () => JSON.parse((await page.getByRole('status', {
    name: 'Fresh results', exact: true
  }).textContent())!)[0]?.result).toEqual(sample.result);
  await expect(page.getByLabel('Fresh', { exact: true })).not.toHaveAttribute('aria-invalid');
  await expect(page.getByRole('status', { name: 'Fresh fields', exact: true }))
    .toHaveText('[{"name":["fresh"],"errors":[],"warnings":[]}]');
});

test('Form keeps focus, selection and UI metadata unchanged during a silent asynchronous check', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Hold validators', exact: true }).check();
  const input = page.getByLabel('Fresh', { exact: true });
  await input.fill('Anna');
  await input.evaluate((node) => (node as HTMLInputElement).setSelectionRange(1, 3));

  await page.getByRole('button', { name: 'Silent validation', exact: true })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await expect(page.getByRole('status', { name: 'Pending validators', exact: true })).toHaveText('1');
  await expect(page.getByRole('status', { name: 'Fresh validating', exact: true })).toHaveText('false');
  await expect(input).toBeFocused();
  await expect(input).toHaveAccessibleDescription('Fresh hint');
  expect(await input.evaluate((node) => [
    (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
  ])).toEqual([1, 3]);
  await page.getByRole('button', { name: 'Complete oldest', exact: true })
    .evaluate((button) => (button as HTMLButtonElement).click());

  await expect(page.getByRole('status', { name: 'Fresh results', exact: true }))
    .toContainText('Older error');
  await expect(input).toBeFocused();
  await expect(input).not.toHaveAttribute('aria-invalid');
  await expect(input).toHaveValue('Anna');
});

for (const firstSilent of [false, true]) {
  test(`Form isolates visible and silent requests when the first is silent=${firstSilent}`, async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Hold validators', exact: true }).check();
    await page.getByRole('button', {
      name: firstSilent ? 'Silent validation' : 'Normal validation', exact: true
    }).click();
    await page.getByRole('button', {
      name: firstSilent ? 'Normal validation' : 'Silent validation', exact: true
    }).click();
    await expect(page.getByRole('status', { name: 'Pending validators', exact: true })).toHaveText('2');

    await page.getByRole('button', {
      name: firstSilent ? 'Complete oldest' : 'Complete newest', exact: true
    }).click();

    await expect(page.getByRole('status', { name: 'Fresh results', exact: true }))
      .toContainText(`"outOfDate":${firstSilent}`);
    await expect(page.getByRole('status', { name: 'Fresh validating', exact: true })).toHaveText('true');
    await expect(page.getByLabel('Fresh', { exact: true })).not.toHaveAttribute('aria-invalid');
    await page.getByRole('button', {
      name: firstSilent ? 'Complete newest' : 'Complete oldest', exact: true
    }).click();

    await expect(page.getByRole('status', { name: 'Fresh validating', exact: true })).toHaveText('false');
    await expect(page.getByLabel('Fresh', { exact: true }))
      .toHaveAccessibleDescription(firstSilent ? 'Newer error' : 'Older error');
  });
}

test('Form rejects a silent snapshot reset while validation is pending', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Hold validators', exact: true }).check();
  await page.getByRole('button', { name: 'Silent validation', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Pending validators', exact: true })).toHaveText('1');

  await page.getByRole('button', { name: 'Reset fresh', exact: true }).click();
  await page.getByRole('button', { name: 'Complete oldest', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Fresh results', exact: true }))
    .toContainText('"outOfDate":true');
  await expect(page.getByLabel('Fresh', { exact: true })).toHaveAccessibleDescription('Fresh hint');
  await expect(page.getByLabel('Fresh', { exact: true })).not.toHaveAttribute('aria-invalid');
});
