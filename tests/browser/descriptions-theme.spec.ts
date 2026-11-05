import { test, expect } from './test';
import reference from './fixtures/ant-design-descriptions-theme-reference.json' with { type: 'json' };
import { snapshotDescriptionsTheme } from './descriptions-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Descriptions tokens match pinned metrics for ${sample.name}`, async ({ page }) => {
    if (sample.viewport) await page.setViewportSize(sample.viewport);
    await page.goto('/?fixture=descriptions-theme');
    await page.getByLabel('Descriptions token preset', { exact: true }).selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotDescriptionsTheme)).toEqual(sample.metrics);
  });
}

test('Descriptions applies the four reported tokens without changing its sibling', async ({ page }) => {
  await page.goto('/?fixture=descriptions-theme');
  const root = page.locator('[data-descriptions-theme="bordered"]');

  await expect(root.locator('.ant-descriptions-header')).toHaveCSS('margin-bottom', '32px');
  await expect(root.locator('.ant-descriptions-title')).toHaveCSS('color', 'rgb(114, 46, 209)');
  await expect(root.locator('.ant-descriptions-item-label').first())
    .toHaveCSS('background-color', 'rgb(246, 255, 237)');
  await expect(root.locator('.ant-descriptions-item-content').first())
    .toHaveCSS('color', 'rgb(135, 56, 0)');
  await expect(page.locator('[data-descriptions-theme="outside"] .ant-descriptions-header'))
    .toHaveCSS('margin-bottom', '20px');
});

test('Descriptions theme updates preserve cells, drafts, focus and independent scopes', async ({ page }) => {
  await page.goto('/?fixture=descriptions-theme');
  const root = page.locator('[data-descriptions-theme="bordered"]');
  const draft = root.getByLabel('Descriptions theme draft', { exact: true });
  const spans = await root.locator('th,td').evaluateAll(cells => cells.map(cell => cell.getAttribute('colspan')));
  await draft.fill('Kept Descriptions draft');
  await draft.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 7));
  const original = await draft.elementHandle();
  await page.getByRole('button', { name: 'Update Descriptions title margin', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(root.locator('.ant-descriptions-header')).toHaveCSS('margin-bottom', '9px');
  for (const [id, margin] of [['nested', 7], ['reset', 5], ['sibling', 10], ['outside', 20]]) {
    await expect(page.locator(`[data-descriptions-theme="${id}"] .ant-descriptions-header`))
      .toHaveCSS('margin-bottom', `${margin}px`);
  }
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Kept Descriptions draft');
  expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
  expect(await draft.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
    .toEqual([2, 7]);
  expect(await root.locator('th,td').evaluateAll(cells => cells.map(cell => cell.getAttribute('colspan'))))
    .toEqual(spans);
  await page.getByLabel('Inherit child Descriptions tokens', { exact: true }).uncheck();

  await expect(page.locator('[data-descriptions-theme="nested"] .ant-descriptions-item-label').first())
    .toHaveCSS('background-color', 'rgb(255, 247, 230)');
  await expect(page.locator('[data-descriptions-theme="nested"] .ant-descriptions-title'))
    .toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
  await page.getByLabel('Apply source Descriptions tokens', { exact: true }).dispatchEvent('click');

  await expect(root.locator('.ant-descriptions-header')).toHaveCSS('margin-bottom', '20px');
  await expect(root).not.toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);
  expect(await draft.evaluate((node, old) => node === old, original)).toBe(true);
  await page.getByLabel('Mount themed Descriptions', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
  await expect(page.locator('[data-descriptions-theme="outside"] .ant-descriptions-header'))
    .toHaveCSS('margin-bottom', '20px');
});
