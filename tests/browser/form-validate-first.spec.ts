import { test, expect } from './test';
import type { Page } from '@playwright/test';
import reference from './fixtures/ant-design-form-validate-first-observation.json' with { type: 'json' };

async function act(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
}

async function snapshot(page: Page) {
  return JSON.parse((await page.getByRole('status', { name: 'First snapshot', exact: true })
    .textContent())!);
}

const ids = [...new Set(reference.cases.map(({ id }) => id))]
  .filter((id) => id !== 'parallel-warning-early' && id !== 'parallel-warning-pass');

for (const id of ids) {
  test(`Form validateFirst follows source scheduling, messages and metadata for ${id}`, async ({ page }) => {
    await page.goto('/?fixture=form-validate-first');
    await act(page, `Start ${id}`);
    const samples = reference.cases.filter((sample) => sample.id === id);
    for (const sample of samples) {
      if (sample.phase !== 'started') {
        const success = id === 'parallel-pass' || sample.phase === 'first'
          && (id === 'serial-pass' || id === 'serial-warning');
        await act(page, `${success ? 'Pass' : 'Fail'} ${sample.phase}`);
      }
      const { id: _id, phase: _phase, ...expected } = sample;
      await expect.poll(() => snapshot(page)).toEqual(expected);
      if (sample.fields[0].errors.length) {
        await expect(page.getByRole('textbox', { name: 'Name', exact: true }))
          .toHaveAttribute('aria-invalid', 'true');
      }
    }
  });
}

for (const fail of [false, true]) {
  test(`Form parallel validation waits for blocking rules after an early warning, failure=${fail}`, async ({ page }) => {
    await page.goto('/?fixture=form-validate-first');
    await act(page, `Start parallel-warning-${fail ? 'early' : 'pass'}`);
    await expect(page.getByRole('status', { name: 'First pending', exact: true })).toHaveText('2');
    await act(page, 'Fail warning');
    await expect(page.getByRole('status', { name: 'First pending', exact: true })).toHaveText('1');
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    expect(await snapshot(page)).toMatchObject({ outcomes: [], validating: true });

    await act(page, `${fail ? 'Fail' : 'Pass'} first`);
    await expect.poll(() => snapshot(page)).toMatchObject({
      outcomes: fail ? [{ status: 'invalid', outOfDate: false, errorFields: [{
        name: ['name'], errors: ['First'], warnings: []
      }] }] : [{ status: 'success' }],
      fields: [{ name: ['name'], errors: fail ? ['First'] : [], warnings: fail ? [] : ['Warning'] }],
      validating: false
    });
  });
}

test('Form validateFirst applies mode changes without replacing the focused input or its selection', async ({ page }) => {
  await page.goto('/?fixture=form-validate-first');
  await act(page, 'Start serial');
  await act(page, 'Fail first');
  await expect.poll(() => snapshot(page)).toMatchObject({ validating: false });
  const input = page.getByRole('textbox', { name: 'Name', exact: true });
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 3); });
  const original = await input.elementHandle();
  await act(page, 'Use all rules');
  await act(page, 'Validate first rules');
  await expect(page.getByRole('status', { name: 'First pending', exact: true })).toHaveText('2');
  await act(page, 'Complete first rules');
  await expect.poll(() => snapshot(page)).toMatchObject({
    fields: [{ name: ['name'], errors: ['First', 'Second'], warnings: [] }], validating: false
  });

  await expect(input).toBeFocused();
  expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
  expect(await input.evaluate((element: HTMLInputElement) =>
    [element.selectionStart, element.selectionEnd]
  )).toEqual([1, 3]);
});

for (const action of ['Change first value', 'Reset first field', 'Toggle first field']) {
  test(`Form validateFirst discards an old result after ${action}`, async ({ page }) => {
    await page.goto('/?fixture=form-validate-first');
    await act(page, 'Start parallel');
    await expect(page.getByRole('status', { name: 'First pending', exact: true })).toHaveText('2');
    await act(page, action);
    await act(page, 'Complete first rules');
    await expect.poll(() => snapshot(page)).toMatchObject({
      outcomes: [{ status: 'invalid', outOfDate: true }], validating: false,
      fields: [{ name: ['name'], errors: [], warnings: [] }]
    });
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
}

test('Form validateFirst keeps silent checks out of visible errors and warnings', async ({ page }) => {
  await page.goto('/?fixture=form-validate-first');
  await act(page, 'Start serial');
  await act(page, 'Fail first');
  await expect.poll(() => snapshot(page)).toMatchObject({ validating: false });
  await act(page, 'Seed first metadata');
  await act(page, 'Validate first silently');
  await expect(page.getByRole('status', { name: 'First pending', exact: true })).toHaveText('1');
  expect(await snapshot(page)).toMatchObject({
    fields: [{ name: ['name'], errors: ['Visible'], warnings: ['Note'] }], validating: false
  });
  await act(page, 'Fail first');

  await expect.poll(async () => (await snapshot(page)).outcomes).toHaveLength(2);
  expect(await snapshot(page)).toMatchObject({
    fields: [{ name: ['name'], errors: ['Visible'], warnings: ['Note'] }], validating: false
  });
});

test('Form submit waits for a blocking validator after a warning and rejects its later error', async ({ page }) => {
  await page.goto('/?fixture=form-validate-first');
  await act(page, 'Start parallel-warning-early');
  await act(page, 'Complete first rules');
  await expect.poll(() => snapshot(page)).toMatchObject({ validating: false });
  await act(page, 'Submit first rules');
  await expect(page.getByRole('status', { name: 'First pending', exact: true })).toHaveText('2');
  await act(page, 'Fail warning');
  await expect(page.getByRole('status', { name: 'First pending', exact: true })).toHaveText('1');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await expect(page.getByRole('status', { name: 'First submitted', exact: true })).toHaveText('[]');
  expect(await snapshot(page)).toMatchObject({ validating: true });
  await act(page, 'Fail first');

  await expect.poll(() => snapshot(page)).toMatchObject({ validating: false });
  await expect(page.getByRole('status', { name: 'First submitted', exact: true })).toHaveText('[]');
  await expect(page.getByRole('textbox', { name: 'Name', exact: true }))
    .toHaveAccessibleDescription('First');
});
