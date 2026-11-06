import { test, expect } from './test';
import reference from './fixtures/ant-design-mentions-theme-reference.json' with { type: 'json' };
import { snapshotMentionsTheme } from './mentions-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=mentions-theme'); });

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Mentions ${scope} theme matches source control and popup for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Mentions theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Mentions theme scope', { exact: true }).selectOption(scope);

        await expect.poll(() => page.evaluate(snapshotMentionsTheme)).toEqual(expected);
      });
  }

  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Mentions ${mode} theme matches source control and popup for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Mentions theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Mentions theme mode', { exact: true }).selectOption(mode);
        const textarea = page.getByRole('combobox', { name: 'Themed Mentions', exact: true });
        await page.mouse.move(1300, 1100);
        if (mode === 'hover') await textarea.hover();
        if (mode === 'error' || mode === 'warning') await textarea.focus();
        if (mode === 'popup') {
          await textarea.fill('');
          await textarea.pressSequentially('@');
          await expect(page.locator('.ant-mentions-dropdown-menu')).toBeAttached();
        }

        await expect.poll(() => page.evaluate(snapshotMentionsTheme)).toEqual(expected);
      });
  }
}

test('Mentions token updates preserve popup position, active option, editor and caret',
  async ({ page }) => {
    const editor = page.getByRole('combobox', { name: 'Themed Mentions', exact: true });
    await editor.fill('');
    await editor.pressSequentially('@');
    await editor.press('ArrowDown');
    const popup = page.locator('.ant-mentions-dropdown');
    const originalEditor = await editor.elementHandle();
    const originalPopup = await popup.elementHandle();
    const active = await editor.getAttribute('aria-activedescendant');
    const events = await page.getByLabel('Mentions theme events', { exact: true }).textContent();
    await editor.evaluate(node => (node as HTMLTextAreaElement).setSelectionRange(0, 1, 'backward'));

    await page.getByRole('button', { name: 'Update Mentions tokens', exact: true })
      .dispatchEvent('click');

    await expect(editor).toHaveCSS('padding-left', '23px');
    await expect(page.getByRole('listbox')).toHaveCSS('max-height', '180px');
    await expect(popup.getByRole('option').first()).toHaveCSS('min-width', '190px');
    expect(await editor.evaluate((node, old) => node === old, originalEditor)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, originalPopup)).toBe(true);
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue('@');
    await expect(editor).toHaveAttribute('aria-activedescendant', active!);
    expect(await editor.evaluate(node => {
      const input = node as HTMLTextAreaElement;
      return [input.selectionStart, input.selectionEnd, input.selectionDirection];
    })).toEqual([0, 1, 'backward']);
    await expect(page.getByLabel('Mentions theme events', { exact: true })).toHaveText(events!);
    expect(await popup.evaluate(node => [node.style.left, node.style.top]
      .every(value => value !== '' && value !== '-9999px'))).toBe(true);

    await editor.press('End');
    await editor.press('ArrowDown');
    await editor.press('Enter');

    await expect(editor).toHaveValue('@beta ');
    await expect(editor).toHaveAttribute('aria-expanded', 'false');
    expect(await page.getByRole('form', { name: 'Mentions theme form' }).evaluate(node =>
      new FormData(node as HTMLFormElement).get('mention'))).toBe('@beta ');
  });

test('Mentions inheritance reset keeps focus, current search and active option', async ({ page }) => {
  await page.getByLabel('Mentions theme scope', { exact: true }).selectOption('nested');
  const editor = page.getByRole('combobox', { name: 'Themed Mentions', exact: true });
  await editor.fill('');
  await editor.pressSequentially('@');
  await editor.press('ArrowDown');
  const original = await editor.elementHandle();
  const active = await editor.getAttribute('aria-activedescendant');
  const events = await page.getByLabel('Mentions theme events', { exact: true }).textContent();

  await page.getByLabel('Inherit Mentions theme', { exact: true }).dispatchEvent('click');

  await expect(editor).toHaveCSS('font-size', '16px');
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('@');
  await expect(editor).toHaveAttribute('aria-activedescendant', active!);
  await expect(page.getByRole('listbox')).toBeVisible();
  expect(await editor.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.getByLabel('Mentions theme events', { exact: true })).toHaveText(events!);
});

test('Mentions returns to legacy styling with its draft and removes popup resources on unmount',
  async ({ page }) => {
    await page.getByLabel('Autosize themed Mentions', { exact: true }).check();
    const editor = page.getByRole('combobox', { name: 'Themed Mentions', exact: true });
    await editor.fill('A longer draft\n');
    await editor.pressSequentially('@');
    const original = await editor.elementHandle();

    await page.getByLabel('Apply source Mentions theme', { exact: true }).dispatchEvent('click');

    await expect(editor).toHaveCSS('font-size', '14px');
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue('A longer draft\n@');
    await expect(page.getByRole('listbox')).toBeVisible();
    expect(await editor.evaluate((node, old) => node === old, original)).toBe(true);

    await page.getByLabel('Mount themed Mentions', { exact: true }).dispatchEvent('click');

    await expect(page.locator('.ant-mentions-dropdown')).toHaveCount(0);
    await expect(page.locator('textarea[name="mentions-measure"]')).toHaveCount(0);
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
  });
