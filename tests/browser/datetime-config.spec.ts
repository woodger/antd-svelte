import { test, expect } from './test';
import reference from './fixtures/ant-design-datetime-config-reference.json' with { type: 'json' };
import { snapshotDatetimeConfig } from './datetime-config-metrics';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(reference.reference.now));
  await page.goto('/?fixture=datetime-config');
});

for (const sample of reference.cases) {
  if (sample.name === 'literal' || sample.name === 'literal-range') continue;

  test(`Datetime config matches source input, header and columns for ${sample.name}`,
    async ({ page }) => {
      await page.getByLabel('Datetime config preset', { exact: true }).selectOption(sample.name);
      await expect(page.getByRole('dialog')).toBeVisible();

      await expect.poll(() => page.evaluate(snapshotDatetimeConfig)).toEqual(sample.metrics);
      await expect(page.getByLabel('Datetime config events', { exact: true })).toHaveText('[]');
    });
}

for (const range of [false, true]) {
  test(`Datetime ${range ? 'range' : 'single'} ignores unit letters inside literal text`,
    async ({ page }) => {
      await page.getByLabel('Datetime config preset', { exact: true })
        .selectOption(range ? 'literal-range' : 'literal');

      const source = reference.cases.find(item => item.name === (range ? 'default-range' : 'default'))!;
      // Source принимает H/s внутри [Hours] за units; native исключает literal.
      const expected = structuredClone(source.metrics);
      expected.inputs = range ? ['2024-09-15 Hours', '2024-09-18 Hours'] : ['2024-09-15 Hours'];
      await expect.poll(() => page.evaluate(snapshotDatetimeConfig)).toEqual(expected);
      await expect(page.getByLabel('Datetime config events', { exact: true })).toHaveText('[]');
    });
}

test('Datetime inferred meridiem changes the draft and preserves UTC and source precision on commit',
  async ({ page }) => {
    await page.getByLabel('Datetime config preset', { exact: true }).selectOption('input-12-hours');
    await page.getByLabel('UTC datetime values', { exact: true }).check();
    const popup = page.getByRole('dialog');
    await popup.getByRole('button', { name: 'AM', exact: true }).click();
    await expect(page.getByLabel('Datetime config events', { exact: true })).toHaveText('[]');

    await popup.getByRole('button', { name: 'OK', exact: true }).click();

    await expect(page.getByRole('combobox', { name: 'Datetime config single', exact: true }))
      .toHaveValue('2024-09-15 12:34 AM');
    await expect(page.getByLabel('Datetime config events', { exact: true })).toHaveText(JSON.stringify([
      { value: '2024-09-15T00:34:56.700Z', utc: true, text: '2024-09-15 12:34 AM' }
    ]));
  });

test('Datetime range applies inferred meridiem to the active boundary and retains both UTC dates',
  async ({ page }) => {
    await page.getByLabel('Datetime config preset', { exact: true })
      .selectOption('input-12-hours-range');
    await page.getByLabel('UTC datetime values', { exact: true }).check();
    const inputs = page.locator('.ant-picker-input input');
    await inputs.nth(1).click();
    const popup = page.getByRole('dialog');
    await popup.getByRole('button', { name: 'AM', exact: true }).click();
    await expect(page.getByLabel('Datetime config events', { exact: true })).toHaveText('[]');

    await popup.getByRole('button', { name: 'OK', exact: true }).click();

    await expect(inputs.first()).toHaveValue('2024-09-15 12:34 PM');
    await expect(inputs.nth(1)).toHaveValue('2024-09-18 06:45 AM');
    await expect(page.getByLabel('Datetime config events', { exact: true }))
      .toHaveText(JSON.stringify(reference.rangeCommitObservation.afterEndConfirm.events));

    await inputs.first().click();
    await popup.getByRole('button', { name: 'OK', exact: true }).click();

    await expect(page.getByLabel('Datetime config events', { exact: true }))
      .toHaveText(JSON.stringify(reference.rangeCommitObservation.afterStartConfirm.events));
  });
