import { test, expect } from './test';
import reference from './fixtures/ant-design-auto-complete-prefix-reference.json' with { type: 'json' };
import { snapshotAutoCompletePrefix } from './auto-complete-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`AutoComplete prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=auto-complete-prefix');
      await page.getByRole('combobox', { name: 'AutoComplete prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'AutoComplete prefix scope', exact: true }).selectOption(scope);
      if ('opened' in entry.sample && entry.sample.opened) {
        await page.getByRole('combobox', { name: 'Prefix choices', exact: true }).click();
      }
      await page.mouse.move(1270, 890);

      await expect.poll(() => page.evaluate(snapshotAutoCompletePrefix)).toEqual(entry.result[scope]);
    });
  }
}

for (const input of ['', 'input', 'textarea']) {
  test(`AutoComplete ${input || 'native'} prefixes preserve the open editor, refs, form value and callbacks`, async ({ page }) => {
    await page.goto('/?fixture=auto-complete-prefix');
    await page.getByRole('checkbox', { name: 'Live AutoComplete prefix', exact: true }).check();
    await page.getByRole('combobox', { name: 'AutoComplete prefix input', exact: true })
      .selectOption(input);
    await page.getByRole('checkbox', { name: 'Portal prefix AutoComplete', exact: true }).check();
    const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
    await control.fill('draft');
    await control.evaluate((node: HTMLInputElement | HTMLTextAreaElement) =>
      node.setSelectionRange(1, 4, 'backward'));
    const root = page.locator('.fixture-auto-complete-prefix');
    const popup = page.getByRole('listbox', { name: 'Prefix choices', exact: true });
    const option = page.getByRole('option', { name: 'Alpha', exact: true });
    const oldRoot = await root.elementHandle();
    const oldInput = await control.elementHandle();
    const oldPopup = await popup.elementHandle();
    const oldOption = await option.elementHandle();
    const id = await control.getAttribute('id');

    for (const step of reference.transitions) {
      await page.getByRole('textbox', { name: 'Live AutoComplete prefix value', exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      if (!input) {
        await expect.poll(() => page.evaluate(snapshotAutoCompletePrefix)).toEqual(step.result);
      }
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      expect(await control.evaluate((node, old) => node === old, oldInput)).toBe(true);
      expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
      expect(await option.evaluate((node, old) => node === old, oldOption)).toBe(true);
      await expect(control).toBeFocused();
      await expect(control).toHaveValue('draft');
      await expect(control).toHaveAttribute('id', id!);
      expect(await control.evaluate((node: HTMLInputElement | HTMLTextAreaElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual(step.selection);
      await expect(page.getByLabel('AutoComplete prefix refs', { exact: true })).toHaveText('true');
      await expect(page.getByLabel('AutoComplete prefix events', { exact: true }))
        .toHaveText('change:draft|search:draft');
      expect(await page.locator('form').evaluate(node =>
        new FormData(node as HTMLFormElement).get('query'))).toBe('draft');
    }
    await page.getByRole('textbox', { name: 'Local AutoComplete prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'owner';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(root).toHaveClass(/owner/);
    await expect(control).toHaveClass(input ? /suite-input/ : /owner-input/);
    await expect(control).toBeFocused();
    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
    await option.click();

    await expect(control).toHaveValue('a');
    await expect(page.getByLabel('AutoComplete prefix events', { exact: true }))
      .toContainText('change:a|select:a');
  });
}
