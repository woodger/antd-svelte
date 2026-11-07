import { test, expect } from './test';
import reference from './fixtures/ant-design-statistic-theme-reference.json' with { type: 'json' };
import { snapshotStatisticTheme } from './statistic-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Statistic tokens match pinned metrics for ${sample.name}`, async ({ page }) => {
    await page.goto('/?fixture=statistic-theme');
    await page.getByLabel('Statistic token preset', { exact: true }).selectOption(sample.name);

    const expected = Object.fromEntries(Object.entries(sample.metrics).map(([id, metrics]) => [id, {
      ...metrics,
      // Native dir=rtl сохраняется; исходный -rtl class в 6.6.8 не задаёт direction.
      direction: 'rtl' in sample && sample.rtl && id !== 'outside' && id !== 'sibling'
        ? 'rtl' : metrics.direction
    }]));
    await expect.poll(() => page.evaluate(snapshotStatisticTheme)).toEqual(expected);
    if (sample.name === 'component-aliases') {
      await expect(page.locator('[data-statistic-theme="loading"] .ant-statistic-skeleton'))
        .toHaveCSS('--ant-padding', '16px');
    }
  });
}

test('Statistic theme updates preserve snippets, focus and independent provider scopes', async ({ page }) => {
  await page.goto('/?fixture=statistic-theme');
  await page.getByLabel('Mount Statistic title draft', { exact: true }).check();
  const root = page.locator('[data-statistic-theme="normal"]');
  const draft = root.getByLabel('Statistic theme draft', { exact: true });
  await draft.fill('Kept Statistic draft');
  await draft.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 7));
  const original = await draft.elementHandle();
  const value = root.locator('.ant-statistic-content-value');
  const originalValue = await value.elementHandle();
  await page.getByRole('button', { name: 'Update Statistic content font', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(root.locator('.ant-statistic-content')).toHaveCSS('font-size', '27px');
  for (const [id, font] of [['nested', 17], ['reset', 24], ['sibling', 19], ['outside', 24]]) {
    await expect(page.locator(`[data-statistic-theme="${id}"] .ant-statistic-content`))
      .toHaveCSS('font-size', `${font}px`);
  }
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Kept Statistic draft');
  expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
  expect(await draft.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
    .toEqual([2, 7]);
  expect(await value.evaluate((node, old) => node === old, originalValue)).toBe(true);
  await expect(value).toHaveText('1,234.56');
  await page.getByLabel('Inherit child Statistic tokens', { exact: true }).uncheck();

  await expect(page.locator('[data-statistic-theme="nested"] .ant-statistic-title'))
    .toHaveCSS('font-size', '14px');
  await page.getByLabel('Apply source Statistic tokens', { exact: true }).dispatchEvent('click');

  await expect(root.locator('.ant-statistic-content')).toHaveCSS('font-size', '24px');
  await expect(root.locator('.ant-statistic-title')).toHaveCSS('font-size', '14px');
  await expect(root).not.toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);
  expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
  await page.getByLabel('Mount themed Statistics', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
  await expect(page.locator('[data-statistic-theme="outside"] .ant-statistic-content'))
    .toHaveCSS('font-size', '24px');
});

test('Statistic Timer countup and countdown keep ticking through component token changes', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-05T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-05T12:00:01Z'));
  await page.goto('/?fixture=statistic-theme');
  const timers = page.locator('[data-statistic-theme="timer"], [data-statistic-theme="countdown"]');
  const values = timers.locator('.ant-statistic-content-value');
  await expect(values).toHaveCount(2);
  const original = await values.elementHandles();
  const before = await values.allTextContents();
  await page.getByRole('button', { name: 'Update Statistic content font', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  for (const timer of await timers.all()) {
    await expect(timer.locator('.ant-statistic-title')).toHaveCSS('font-size', '18px');
    await expect(timer.locator('.ant-statistic-content')).toHaveCSS('font-size', '27px');
  }
  await page.clock.runFor(1000);

  for (const [index, value] of (await values.all()).entries()) {
    expect(await value.evaluate((node, old) => node === old, original[index])).toBe(true);
    await expect(value).not.toHaveText(before[index]);
  }
});
