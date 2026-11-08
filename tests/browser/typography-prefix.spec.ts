import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-typography-prefix-reference.json' with { type: 'json' };
import { snapshotTypographyPrefix } from './typography-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Typography prefix matches source styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=typography-prefix');
    await page.getByRole('combobox', { name: 'Typography prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotTypographyPrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Typography prefix value' : 'Live Typography prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test(
  'Typography prefix updates retain editor draft, selection, focus and link identity',
  async ({ page }) => {
    await page.goto('/?fixture=typography-prefix');
    await page.getByRole('checkbox', { name: 'Live Typography prefix', exact: true }).check();
    const scope = page.locator('[data-typography-prefix-scope="normal"]');
    const link = scope.getByRole('link', { name: 'Linked text', exact: true });
    const oldLink = await link.elementHandle();
    await scope.getByRole('button', { name: 'Edit', exact: true }).click();
    const editor = scope.locator('textarea');
    const oldEditor = await editor.elementHandle();
    await editor.fill('kept draft');
    await editor.evaluate((node: HTMLTextAreaElement) => { node.setSelectionRange(1, 5); });

    for (const step of reference.transitions) {
      await setPrefix(page, step.prefix);

      await expect.poll(() => page.evaluate(snapshotTypographyPrefix)).toEqual(step.freshResult);
      expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(step.sameEditor);
      expect(await link.evaluate((node, old) => node === old, oldLink)).toBe(step.sameLink);
      await expect(editor).toHaveValue(step.value);
      expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
      expect(await editor.evaluate((node: HTMLTextAreaElement) => [
        node.selectionStart, node.selectionEnd
      ]))
        .toEqual(step.selection);
    }
    await setPrefix(page, 'prose', true);

    await expect(scope.locator('[data-prefix-part="actions"] > div')).toHaveClass(/prose-edit-content/);
    await expect(editor).toBeFocused();
    await editor.evaluate((node: HTMLTextAreaElement) => {
      node.setSelectionRange(node.value.length, node.value.length);
    });
    await editor.press('Enter');

    await expect(scope.getByLabel('normal Typography prefix events')).toHaveText('save:kept draft');
    await expect(scope.getByRole('button', { name: 'Edit', exact: true })).toBeFocused();
  }
);

test(
  'Typography prefix updates preserve copy success and independent sibling styling',
  async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/?fixture=typography-prefix');
    await page.getByRole('checkbox', { name: 'Live Typography prefix', exact: true }).check();
    const scope = page.locator('[data-typography-prefix-scope="normal"]');
    const copy = scope.getByRole('button', { name: 'Copy', exact: true });
    const oldCopy = await copy.elementHandle();
    await copy.click();
    await expect(scope.getByLabel('normal Typography prefix events')).toHaveText('copy');
    await setPrefix(page, 'next');
    const success = scope.getByRole('button', { name: 'Copied', exact: true });

    await expect(success).toHaveClass(/next-typography-copy-success/);
    expect(await success.evaluate((node, old) => node === old, oldCopy)).toBe(true);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Copied draft');
    await expect(page.locator('[data-typography-prefix-scope="sibling"] h3'))
      .toHaveClass(/ant-typography/);
  }
);
