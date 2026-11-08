import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-breadcrumb-prefix-reference.json' with { type: 'json' };
import { snapshotBreadcrumbPrefix } from './breadcrumb-prefix-metrics';

for (const entry of reference.cases) {
  test(`Breadcrumb prefix matches source geometry for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=breadcrumb-prefix');
    await page.getByRole('combobox', { name: 'Breadcrumb prefix sample', exact: true })
      .selectOption(entry.sample.id);
    // Source separator игнорирует local owner prefix; semantic class восстанавливает его CSS.
    const expected = 'matchedSeparators' in entry ? entry.matchedSeparators : entry.result;

    await expect.poll(() => page.evaluate(snapshotBreadcrumbPrefix)).toEqual(expected);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Breadcrumb prefix value' : 'Live Breadcrumb prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Breadcrumb prefix updates retain native links, menu trigger, focus and navigation', async ({ page }) => {
  await page.goto('/?fixture=breadcrumb-prefix');
  await page.getByRole('checkbox', { name: 'Live Breadcrumb prefix', exact: true }).check();
  const scope = page.locator('[data-breadcrumb-prefix-scope="normal"]');
  const root = scope.locator('nav');
  const link = scope.getByRole('link', { name: 'First', exact: true });
  const menu = scope.getByRole('link', { name: 'Section v', exact: true });
  const oldRoot = await root.elementHandle();
  const oldLink = await link.elementHandle();
  const oldMenu = await menu.elementHandle();
  await link.focus();

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotBreadcrumbPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await link.evaluate((node, old) => node === old, oldLink)).toBe(step.sameLink);
    expect(await menu.evaluate((node, old) => node === old, oldMenu)).toBe(step.sameMenu);
    expect(await link.evaluate(node => node === document.activeElement)).toBe(step.focused);
  }
  await link.press('Enter');

  await expect(page).toHaveURL(/#bc-prefix-one$/);
  await expect(scope.getByLabel('normal breadcrumb prefix clicks', { exact: true })).toHaveText('1');
  await expect(link).toBeFocused();
});

test('Breadcrumb changes its local prefix without replacing an open menu or stealing focus', async ({ page }) => {
  await page.goto('/?fixture=breadcrumb-prefix');
  await page.getByRole('checkbox', { name: 'Live Breadcrumb prefix', exact: true }).check();
  const scope = page.locator('[data-breadcrumb-prefix-scope="normal"]');
  const trigger = scope.getByRole('link', { name: 'Section v', exact: true });
  await trigger.focus();
  await trigger.press('ArrowDown');
  const item = page.getByRole('menuitem', { name: 'Menu entry', exact: true });
  const oldItem = await item.elementHandle();
  const oldTrigger = await trigger.elementHandle();
  await expect(item).toBeFocused();
  await setPrefix(page, 'trail', true);

  await expect(scope.locator('nav')).toHaveClass(/trail/);
  await expect(scope.locator('.trail-separator').first()).toHaveCSS('margin-inline-start', '8px');
  await expect(item).toBeFocused();
  expect(await item.evaluate((node, old) => node === old, oldItem)).toBe(true);
  expect(await trigger.evaluate((node, old) => node === old, oldTrigger)).toBe(true);
  await item.press('Escape');

  await expect(trigger).toBeFocused();
  await expect(item).toBeHidden();
  await trigger.press('ArrowDown');
  await item.press('Enter');

  await expect(scope.getByLabel('normal breadcrumb menu clicks', { exact: true })).toHaveText('1');
  await expect(trigger).toBeFocused();
});
