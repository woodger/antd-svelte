import { test, expect } from './test';
import reference from './fixtures/ant-design-timeline-prefix-reference.json' with { type: 'json' };
import { snapshotTimelinePrefix } from './timeline-prefix-metrics';

for (const entry of reference.cases) {
  test(`Timeline prefix matches source slots and layer priority for ${entry.sample.id}`, async ({ page }) => {
    const width = 'width' in entry.sample ? entry.sample.width ?? 1100 : 1100;
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?fixture=timeline-prefix');
    await page.getByRole('combobox', { name: 'Timeline prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotTimelinePrefix)).toEqual(entry.metrics);
  });
}

test('Timeline prefix and callback props update without replacing the root or affecting sibling scope', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto('/?fixture=timeline-prefix');
  const select = page.getByRole('combobox', { name: 'Timeline prefix transition', exact: true });
  await select.selectOption('before');
  const original = await page.locator('[data-timeline-prefix="normal"] ol').elementHandle();

  for (const entry of reference.transitions) {
    await select.selectOption(entry.step);

    await expect.poll(() => page.evaluate(snapshotTimelinePrefix)).toEqual(entry.metrics);
    expect(entry.sameRoot).toBe(true);
    expect(await page.evaluate(node => node === document.querySelector(
      '[data-timeline-prefix="normal"] ol'
    ), original)).toBe(true);
  }
});
