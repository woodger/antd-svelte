import { test, expect } from './test';
import reference from './fixtures/ant-design-statistic-config-reference.json' with { type: 'json' };
import { snapshotStatisticConfig } from './statistic-config-metrics';

for (const entry of reference.cases) {
  test(`Statistic config matches source slots and priority for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=statistic-config');
    await page.getByRole('combobox', { name: 'Statistic config sample', exact: true })
      .selectOption(entry.sample.id);
    // Прежний native dir=rtl исправляет зафиксированный Source root direction=ltr.
    const expected = Object.fromEntries(Object.entries(entry.metrics).map(([key, value]) =>
      [key, { ...value, direction: entry.sample.direction }]));

    await expect.poll(() => page.evaluate(snapshotStatisticConfig)).toEqual(expected);
  });
}

test('Statistic config and callback props update without replacing roots or affecting sibling config', async ({ page }) => {
  await page.goto('/?fixture=statistic-config');
  const select = page.getByRole('combobox', { name: 'Statistic config transition', exact: true });
  await select.selectOption('before');
  const original = await page.locator('[data-statistic-config="normal"]').elementHandle();

  for (const entry of reference.transitions) {
    await select.selectOption(entry.step);

    await expect.poll(() => page.evaluate(snapshotStatisticConfig)).toEqual(entry.metrics);
    expect(entry.sameRoot).toBe(true);
    await expect(page.locator('[data-statistic-config="normal"]')).toHaveCount(1);
    expect(await page.evaluate(node => node === document.querySelector(
      '[data-statistic-config="normal"]'
    ), original)).toBe(true);
  }
});
