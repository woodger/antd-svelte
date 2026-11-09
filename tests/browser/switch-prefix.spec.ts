import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-switch-prefix-reference.json' with { type: 'json' };
import { snapshotSwitchPrefix } from './switch-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Switch prefixes match source styles and state for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=switch-prefix');
    await page.getByRole('combobox', { name: 'Switch prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotSwitchPrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Switch prefix value' : 'Live Switch prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Switch prefix changes retain checked state, nodes, refs, focus and Native form values', async ({
  page
}) => {
  await page.goto('/?fixture=switch-prefix');
  await page.getByRole('checkbox', { name: 'Live Switch prefix', exact: true }).check();
  const scope = page.locator('[data-switch-prefix-scope="normal"]');
  const control = scope.getByRole('switch', { name: 'normal toggle', exact: true });
  const oldSwitch = await control.elementHandle();
  await control.click();
  const editor = scope.getByRole('textbox', { name: 'normal switch draft', exact: true });
  const oldEditor = await editor.elementHandle();
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotSwitchPrefix)).toEqual(step.result);
    expect(await control.evaluate((node, old) => node === old, oldSwitch)).toBe(step.sameSwitch);
    expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(step.sameEditor);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
      .toBe(step.formValue);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('normal-enabled')))
      .toBe('on');
    await expect(scope.getByLabel('normal switch refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal switch events')).toHaveText('true');
  }
  await setPrefix(page, 'toggle', true);

  await expect(control).toHaveClass(/toggle-checked/);
  await expect(editor).toBeFocused();
  await control.focus();
  await page.keyboard.press('ArrowLeft');

  await expect(control).not.toBeChecked();
  await expect(scope.getByLabel('normal switch events')).toHaveText('true|false');
  expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('normal-enabled')))
    .toBeNull();
});
