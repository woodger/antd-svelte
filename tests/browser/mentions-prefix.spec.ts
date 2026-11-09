import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-mentions-prefix-reference.json' with { type: 'json' };
import { snapshotMentionsPrefix } from './mentions-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Mentions prefixes match source editor/popup CSS for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=mentions-prefix');
    await page.getByRole('combobox', { name: 'Mentions prefix sample', exact: true })
      .selectOption(entry.sample.id);
    if ('popup' in entry.sample && entry.sample.popup) {
      const editor = page.getByRole('combobox', { name: 'normal mention', exact: true });
      await editor.fill('');
      await editor.pressSequentially('@');
    }
    const measured = 'nativeEmpty' in entry ? entry.nativeEmpty : entry.result;
    const expected = 'freshNested' in entry
      ? { ...measured, nested: entry.freshNested } : measured;

    await expect.poll(() => page.evaluate(snapshotMentionsPrefix)).toEqual(expected);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Mentions prefix value' : 'Live Mentions prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Mentions prefix updates retain popup, query, editor, focus, selection and form values', async ({
  page
}) => {
  await page.goto('/?fixture=mentions-prefix');
  await page.getByRole('checkbox', { name: 'Live Mentions prefix', exact: true }).check();
  const scope = page.locator('[data-mentions-prefix-scope="normal"]');
  const root = scope.locator('.fixture-mentions-prefix');
  const editor = scope.getByRole('combobox', { name: 'normal mention', exact: true });
  await editor.fill('');
  await editor.pressSequentially('@');
  const popup = page.locator('.fixture-normal-mentions-popup');
  await expect(popup).toBeVisible();
  const oldRoot = await root.elementHandle();
  const oldEditor = await editor.elementHandle();
  const oldPopup = await popup.elementHandle();
  const id = await editor.getAttribute('id');

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotMentionsPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(step.sameEditor);
    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(step.samePopup);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLTextAreaElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('normal-comment')))
      .toBe(step.formValue);
    await expect(editor).toHaveAttribute('id', id!);
    await expect(scope.getByLabel('normal Mentions ref')).toHaveText('mounted');
  }
  await setPrefix(page, 'mention', true);

  await expect(root).toHaveClass(/mention/);
  await expect(popup).toHaveClass(/mention-dropdown/);
  await expect(editor).toBeFocused();
  await expect(popup.getByRole('option')).toHaveCount(3);

  await editor.press('ArrowDown');
  await editor.press('Enter');

  await expect(editor).toHaveValue('@beta ');
  await expect(popup).toBeHidden();
  await expect(scope.getByLabel('normal Mentions events')).toHaveText('beta');
  expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('normal-comment')))
    .toBe('@beta ');
});
