import { test, expect } from './test';
import reference from './fixtures/ant-design-timeline-config-reference.json' with { type: 'json' };
import { snapshotTimelineConfig } from './timeline-config-metrics';

for (const entry of reference.cases) {
  test(`Timeline config matches source slots and layer priority for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=timeline-config');
    await page.getByRole('combobox', { name: 'Timeline config sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotTimelineConfig)).toEqual(entry.metrics);
  });
}

test('Timeline config and callback props update without replacing the root or affecting sibling scope', async ({ page }) => {
  await page.goto('/?fixture=timeline-config');
  const select = page.getByRole('combobox', { name: 'Timeline config transition', exact: true });
  await select.selectOption('before');
  const original = await page.locator('[data-timeline-config="normal"] ol').elementHandle();

  for (const entry of reference.transitions) {
    await select.selectOption(entry.step);

    await expect.poll(() => page.evaluate(snapshotTimelineConfig)).toEqual(entry.metrics);
    expect(entry.sameRoot).toBe(true);
    expect(await page.evaluate(node => node === document.querySelector(
      '[data-timeline-config="normal"] ol'
    ), original)).toBe(true);
  }
});
