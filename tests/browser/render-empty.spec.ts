import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-render-empty-reference.json' with { type: 'json' };
import nativeReference from './fixtures/render-empty-native-reference.json' with { type: 'json' };
import { snapshotRenderEmpty } from './render-empty-metrics';

async function choose(page: Page, name: string, component: string) {
  await page.getByRole('combobox', { name: 'Render empty case', exact: true }).selectOption(name);

  if (component === 'Select') {
    await page.getByRole('combobox', { name: 'Empty Select', exact: true }).click();
  } else if (component === 'Mentions') {
    await page.locator('[data-render-empty-frame] textarea').fill('@missing');
  } else if (component === 'Table.filter') {
    await page.getByRole('button', { name: 'Filter: Name', exact: true }).click();
  }
}

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=render-empty');

  await expect(page.getByRole('heading', { name: 'ConfigProvider renderEmpty', exact: true }))
    .toBeVisible();
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
});

for (const sample of reference.cases) {
  const native = nativeReference.cases.find(item => item.name === sample.name);
  const title = native ? `renderEmpty preserves native ${sample.name}`
    : `renderEmpty matches the source for ${sample.name}`;

  test(title, async ({ page }) => {
    await choose(page, sample.name, sample.component);

    await expect.poll(() => page.evaluate(snapshotRenderEmpty, sample.component))
      .toEqual(native?.snapshot ?? sample.snapshot);
  });
}

test('renderEmpty preserves snippet state, focus and selection across producer replacement', async ({ page }) => {
  await choose(page, 'Select-snippet', 'Select');
  const draft = page.getByRole('textbox', { name: 'Empty global draft', exact: true });
  const original = await draft.elementHandle();
  await draft.fill(reference.interaction.value);
  await draft.evaluate(node => (node as HTMLInputElement).setSelectionRange(3, 8));
  await page.getByRole('button', { name: 'Empty global action 0', exact: true })
    .dispatchEvent('click');
  await page.getByRole('button', { name: 'Replace empty producer', exact: true })
    .dispatchEvent('click');

  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue(reference.interaction.value);
  await expect(page.getByRole('button', { name: 'Empty global action 1', exact: true })).toBeVisible();
  expect(await draft.evaluate((node, previous) => node === previous, original)).toBe(true);
  expect(await draft.evaluate(node => [(node as HTMLInputElement).selectionStart,
    (node as HTMLInputElement).selectionEnd])).toEqual(reference.interaction.selection);
  await page.getByRole('button', { name: 'After render empty', exact: true }).focus();

  await expect(page.locator('[data-render-empty-frame] .ant-select-dropdown')).toHaveCount(0);
});

test('renderEmpty updates producer values and restores the native default after config removal', async ({ page }) => {
  await choose(page, 'Select-text', 'Select');
  await page.getByRole('button', { name: 'Change empty producer value', exact: true })
    .dispatchEvent('click');

  await expect(page.locator('.ant-select-item-empty')).toHaveText('Global Select!');
  await page.getByRole('button', { name: 'Remove empty producer', exact: true })
    .dispatchEvent('click');

  await expect(page.locator('.ant-select-item-empty')).toHaveText('No options');
  await expect(page.locator('.ant-select-item-empty .ant-empty')).toHaveCount(0);
});

test('renderEmpty delivers the actual filter name while retaining native Table focus controls', async ({ page }) => {
  await choose(page, 'Table.filter-text', 'Table.filter');
  const dialog = page.getByRole('dialog', { name: 'Filter: Name', exact: true });

  await expect(dialog).toContainText('Global Table.filter');
  await page.keyboard.press('Escape');

  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Filter: Name', exact: true })).toBeFocused();
});
