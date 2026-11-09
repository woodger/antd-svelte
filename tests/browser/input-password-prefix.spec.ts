import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-input-password-prefix-reference.json' with {
  type: 'json'
};
import { snapshotInputPasswordPrefix } from './input-password-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Password prefixes preserve source styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=input-password-prefix');
    await page.getByRole('combobox', { name: 'Password prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotInputPasswordPrefix))
      .toEqual(entry.expectedNative);
  });
}

async function setPrefix(page: Page, name: string, value: string) {
  await page.getByRole('textbox', { name, exact: true }).evaluate(
    (node: HTMLInputElement, value) => {
      node.value = value;
      node.dispatchEvent(new Event('input', { bubbles: true }));
    }, value
  );
}

test('Password prefix updates retain visibility, value, nodes, refs and selection', async ({
  page
}) => {
  await page.goto('/?fixture=input-password-prefix');
  await page.getByRole('checkbox', { name: 'Live Password prefix', exact: true }).check();
  const scope = page.locator('[data-password-prefix-scope="normal"]');
  const input = scope.locator('input');
  const root = scope.locator('.fixture-password-root');
  const toggle = root.locator('[aria-pressed]');
  const oldInput = await input.elementHandle();
  const oldRoot = await root.elementHandle();
  const oldToggle = await toggle.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });
  await toggle.click();

  for (const step of reference.transitions) {
    await setPrefix(page, 'Live Password prefix value', step.prefix);

    await expect.poll(() => page.evaluate(snapshotInputPasswordPrefix)).toEqual(step.result);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await toggle.evaluate((node, old) => node === old, oldToggle)).toBe(step.sameToggle);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => [...new FormData(node as HTMLFormElement).entries()]))
      .toEqual(step.formValues);
    await expect(scope.getByLabel('normal password refs')).toHaveText('mounted');
    await expect(scope.getByLabel('normal password events')).toHaveText('value:kept draft');
  }
  await setPrefix(page, 'Local Password prefix value', 'secret');
  await setPrefix(page, 'Local Password input prefix value', 'field');

  await expect(root).toHaveClass(/field-affix-wrapper/);
  await expect(root).toHaveClass(/secret/);
  await expect(toggle).toHaveClass(/secret-icon/);
  await expect(toggle).toHaveCSS('cursor', 'pointer');
  await expect(input).toBeFocused();
  await toggle.focus();
  await page.keyboard.press('Space');

  await expect(input).toHaveAttribute('type', 'password');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(input).not.toHaveAttribute('value');
  await expect(scope.getByLabel('normal password events')).toHaveText('value:kept draft');
});
