import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tour-prefix-reference.json' with { type: 'json' };
import { snapshotTourPrefix } from './tour-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Tour prefixes match source panel and arrow styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=tour-prefix');
    await page.getByRole('combobox', { name: 'Tour prefix sample', exact: true })
      .selectOption(entry.sample.id);

    for (const scope of ['normal', 'nested', 'sibling'] as const) {
      await page.getByRole('combobox', { name: 'Tour prefix scope', exact: true }).selectOption(scope);
      const expected = scope === 'nested' && 'freshNested' in entry
        ? entry.freshNested : entry.scopes[scope];

      await expect.poll(() => page.evaluate(snapshotTourPrefix)).toEqual(expected);
    }
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Tour prefix value' : 'Live Tour prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Tour prefix updates retain the open step, popup, draft, focus and selection', async ({ page }) => {
  await page.goto('/?fixture=tour-prefix');
  await page.getByRole('checkbox', { name: 'Live Tour prefix', exact: true }).check();
  const root = page.locator('.fixture-tour-prefix:has(.fixture-tour-section)');
  const oldPopup = await root.elementHandle();
  const editor = root.getByRole('textbox', { name: 'Tour prefix draft', exact: true });
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });
  const oldEditor = await editor.elementHandle();

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotTourPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldPopup)).toBe(step.samePopup);
    expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(step.sameEditor);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    await expect(page.getByLabel('Tour prefix events')).toHaveText('');
    await expect(root.locator('.fixture-tour-title')).toHaveText('Stored step');
  }
  await setPrefix(page, 'guide', true);

  await expect(root).toHaveClass(/guide/);
  await expect(editor).toBeFocused();
  expect(await root.evaluate((node, old) => node === old, oldPopup)).toBe(true);

  await root.getByRole('button', { name: 'Next', exact: true }).click();

  await expect(root.locator('.fixture-tour-title')).toHaveText('Last');
  await expect(page.getByLabel('Tour prefix events')).toHaveText('change:2');

  await root.getByRole('button', { name: 'Finish', exact: true }).click();

  await expect(root).toBeVisible();
  await expect(page.getByLabel('Tour prefix events')).toHaveText('change:2|close:2|finish');
});
