import { test, expect } from './test';
import reference from './fixtures/ant-design-card-theme-reference.json' with { type: 'json' };
import { snapshotCardTheme } from './card-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Card component tokens match the pinned source for ${sample.name}`, async ({ page }) => {
    await page.goto('/?fixture=card-theme');
    await page.getByLabel('Card token preset', { exact: true }).selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotCardTheme)).toEqual(sample.metrics);
  });
}

test('Card tokens work with the public cssVar object input', async ({ page }) => {
  await page.goto('/?fixture=card-theme');
  await page.getByLabel('Use public cssVar object', { exact: true }).check();

  const sample = reference.cases.find(item => item.name === 'reported-true')!;
  await expect.poll(() => page.evaluate(snapshotCardTheme)).toEqual(sample.metrics);
});

test('Card token updates keep drafts, nodes, focus and independent provider scopes', async ({ page }) => {
  await page.goto('/?fixture=card-theme');
  const root = page.locator('[data-card-theme="normal"]');
  const draft = root.getByLabel('Card theme draft', { exact: true });
  await draft.fill('Kept Card draft');
  const original = await draft.elementHandle();
  await draft.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 7));

  await page.getByRole('button', { name: 'Update Card body padding', exact: true })
    .evaluate(node => (node as HTMLButtonElement).click());

  await expect(root.locator('.ant-card-body')).toHaveCSS('padding', '9px');
  await expect(page.locator('[data-card-theme="nested"] .ant-card-body'))
    .toHaveCSS('padding', '7px');
  await expect(page.locator('[data-card-theme="reset"] .ant-card-body'))
    .toHaveCSS('padding', '5px');
  await expect(page.locator('[data-card-theme="sibling"] .ant-card-body'))
    .toHaveCSS('padding', '10px');
  await expect(page.locator('[data-card-theme="outside"] .ant-card-body'))
    .toHaveCSS('padding', '24px');
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Kept Card draft');
  expect(await draft.evaluate((node, before) => node === before, original)).toBe(true);
  expect(await draft.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
    .toEqual([2, 7]);

  await page.getByLabel('Inherit child Card tokens', { exact: true }).uncheck();

  await expect(page.locator('[data-card-theme="nested"] .ant-card-head'))
    .toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('[data-card-theme="nested"] .ant-card-body'))
    .toHaveCSS('padding', '7px');
  await expect(root.locator('.ant-card-body')).toHaveCSS('padding', '9px');

  await page.getByLabel('Apply source Card tokens', { exact: true }).dispatchEvent('click');

  await expect(root.locator('.ant-card-body')).toHaveCSS('padding', '24px');
  await expect(root.locator('.ant-card-head')).toHaveCSS('min-height', '56px');
  await expect(root).not.toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);
  expect(await draft.evaluate((node, before) => node === before, original)).toBe(true);

  await page.getByLabel('Mount themed Cards', { exact: true }).uncheck();

  await expect(root).toHaveCount(0);
  await expect(page.locator('[data-card-theme="outside"] .ant-card-body'))
    .toHaveCSS('padding', '24px');

  await page.getByLabel('Mount themed Cards', { exact: true }).check();

  await expect(root.locator('.ant-card-body')).toHaveCSS('padding', '24px');
  await expect(root.getByLabel('Card theme draft', { exact: true })).toHaveValue('Draft');
});
