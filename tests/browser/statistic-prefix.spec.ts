import { test, expect } from './test';
import reference from './fixtures/ant-design-statistic-prefix-reference.json' with { type: 'json' };
import { snapshotStatisticPrefix } from './statistic-prefix-metrics';

for (const entry of reference.cases) {
  test(`Statistic prefix preserves source CSS, parts and sibling scope for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=statistic-prefix');
    await page.getByRole('combobox', { name: 'Statistic prefix sample', exact: true })
      .selectOption(entry.sample.id);
    const expected = Object.fromEntries(Object.entries(entry.metrics).map(([key, value]) =>
      [key, { ...value, direction: entry.sample.direction }]));

    await expect.poll(() => page.evaluate(snapshotStatisticPrefix)).toEqual(expected);
  });
}

test('Statistic changes prefix and restores defaults without replacing roots or leaking sibling CSS', async ({ page }) => {
  await page.goto('/?fixture=statistic-prefix');
  const select = page.getByRole('combobox', { name: 'Statistic prefix transition', exact: true });
  await select.selectOption('before');
  const original = await page.locator('[data-statistic-config="normal"]').elementHandle();

  for (const entry of reference.transitions) {
    await select.selectOption(entry.step);

    await expect.poll(() => page.evaluate(snapshotStatisticPrefix)).toEqual(entry.metrics);
    expect(entry.sameRoot).toBe(true);
    await expect(page.locator('[data-statistic-config="normal"]')).toHaveCount(1);
    expect(await page.evaluate(node => node === document.querySelector(
      '[data-statistic-config="normal"]'
    ), original)).toBe(true);
  }
});
