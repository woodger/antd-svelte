import { test, expect } from './test';
import reference from './fixtures/ant-design-steps-config-reference.json' with { type: 'json' };
import { snapshotStepsConfig } from './steps-config-metrics';

for (const entry of reference.cases) {
  test(`Steps config matches source slots and layer priority for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=steps-config');
    await page.getByRole('combobox', { name: 'Steps config sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotStepsConfig)).toEqual(entry.metrics);
  });
}

test('Steps config and callback props update without replacing the root or affecting sibling scope', async ({ page }) => {
  await page.goto('/?fixture=steps-config');
  const select = page.getByRole('combobox', { name: 'Steps config transition', exact: true });
  await select.selectOption('before');
  const original = await page.locator('[data-steps-config="normal"] > :first-child').elementHandle();

  for (const entry of reference.transitions) {
    await select.selectOption(entry.step);

    await expect.poll(() => page.evaluate(snapshotStepsConfig)).toEqual(entry.metrics);
    expect(entry.sameRoot).toBe(true);
    expect(await page.evaluate(node => node === document.querySelector(
      '[data-steps-config="normal"] > :first-child'
    ), original)).toBe(true);
  }
});
